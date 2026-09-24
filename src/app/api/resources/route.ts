import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { ResourceReviewStatus, ResourceStatus } from "@prisma/client";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { getRequestUser, requireApiUser } from "@/lib/auth";
import { resourceCreateSchema } from "@/lib/validation";
import { getStorageService } from "@/services/storage";
import { validateUpload } from "@/services/storage/storage-service";
import { resourceInclude } from "@/repositories/resources";
import { enforceSameOrigin } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  const resources = await prisma.resource.findMany({
    where: user?.role === "admin" ? undefined : { status: "published" },
    include: resourceInclude,
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return NextResponse.json({ resources });
}

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const user = await requireApiUser(request);
  if (user instanceof Response) return user;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A resource file is required." }, { status: 400 });

  const parsed = resourceCreateSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    unitId: form.get("unitId"),
    resourceTypeId: form.get("resourceTypeId"),
    academicYearId: form.get("academicYearId"),
    semesterId: form.get("semesterId") || undefined,
    status: form.get("status") || "published"
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid resource details.", details: parsed.error.flatten() }, { status: 400 });

  const unit = await prisma.unit.findUnique({
    where: { id: parsed.data.unitId },
    include: { program: { include: { department: { select: { schoolId: true } } } } }
  });
  if (!unit) return NextResponse.json({ error: "The selected unit was not found." }, { status: 400 });
  if (user.role === "student" && user.schoolId && unit.program.department.schoolId !== user.schoolId) {
    return NextResponse.json({ error: "You can only submit resources for your school." }, { status: 403 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let mimeType: string;
  try {
    mimeType = validateUpload(buffer, file.type || "application/octet-stream", env.MAX_UPLOAD_BYTES);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid upload." }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (![".pdf", ".docx", ".pptx", ".xlsx", ".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    return NextResponse.json({ error: "That file extension is not allowed." }, { status: 400 });
  }
  const key = `resources/${parsed.data.unitId}/${randomUUID()}${extension}`;
  const storage = getStorageService();
  await storage.upload(buffer, key, mimeType);

  const resource = await prisma.resource.create({
    data: {
      ...parsed.data,
      semesterId: parsed.data.semesterId || null,
      status: user.role === "admin" ? parsed.data.status as ResourceStatus : ResourceStatus.draft,
      reviewStatus: user.role === "admin" && parsed.data.status === "published" ? ResourceReviewStatus.approved : ResourceReviewStatus.pending,
      storageKey: key,
      fileName: file.name,
      fileType: mimeType,
      fileSizeBytes: buffer.length,
      uploadedById: user.id
    },
    include: resourceInclude
  });

  return NextResponse.json({ resource }, { status: 201 });
}
