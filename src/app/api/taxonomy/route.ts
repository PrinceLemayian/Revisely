import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/repositories/taxonomy";
import { taxonomyEntitySchema } from "@/lib/validation";
import { enforceSameOrigin } from "@/lib/csrf";

export async function GET() {
  return NextResponse.json(await getTaxonomy());
}

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;

  const body = await request.json().catch(() => null);
  const parsed = taxonomyEntitySchema.extend({ entity: taxonomyEntitySchema.shape.name }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid taxonomy input.", details: parsed.error.flatten() }, { status: 400 });

  const { entity, name, code, parentId, description } = parsed.data;
  if (entity === "school") {
    return NextResponse.json(await prisma.school.create({ data: { name, code: code ?? name.toUpperCase().slice(0, 8) } }));
  }
  if (entity === "department") {
    if (!parentId || !code) return NextResponse.json({ error: "Department requires a school and code." }, { status: 400 });
    return NextResponse.json(await prisma.department.create({ data: { name, code, schoolId: parentId } }));
  }
  if (entity === "program") {
    if (!parentId || !code) return NextResponse.json({ error: "Program requires a department and code." }, { status: 400 });
    return NextResponse.json(await prisma.program.create({ data: { name, code, departmentId: parentId } }));
  }
  if (entity === "unit") {
    if (!parentId || !code) return NextResponse.json({ error: "Unit requires a program and unit code." }, { status: 400 });
    return NextResponse.json(await prisma.unit.create({ data: { name, code: code.replace(/[^a-z0-9]/gi, "").toUpperCase(), description, programId: parentId } }));
  }
  if (entity === "year") {
    return NextResponse.json(await prisma.academicYear.create({ data: { label: name } }));
  }
  return NextResponse.json({ error: "Unsupported taxonomy entity." }, { status: 400 });
}
