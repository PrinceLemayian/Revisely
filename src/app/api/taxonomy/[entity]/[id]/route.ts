import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { enforceSameOrigin } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { taxonomyEntitySchema } from "@/lib/validation";

type Params = { params: Promise<{ entity: string; id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;

  const { entity, id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = taxonomyEntitySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid taxonomy update.", details: parsed.error.flatten() }, { status: 400 });

  const { name, code, description, parentId } = parsed.data;
  if (entity === "schools") return NextResponse.json(await prisma.school.update({ where: { id }, data: { name, code } }));
  if (entity === "departments") return NextResponse.json(await prisma.department.update({ where: { id }, data: { name, code, schoolId: parentId } }));
  if (entity === "programs") return NextResponse.json(await prisma.program.update({ where: { id }, data: { name, code, departmentId: parentId } }));
  if (entity === "units") return NextResponse.json(await prisma.unit.update({ where: { id }, data: { name, code, description, programId: parentId } }));
  if (entity === "academic-years") return NextResponse.json(await prisma.academicYear.update({ where: { id }, data: { label: name } }));
  return NextResponse.json({ error: "Unsupported taxonomy entity." }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;

  const { entity, id } = await params;
  try {
    if (entity === "schools") await prisma.school.delete({ where: { id } });
    else if (entity === "departments") await prisma.department.delete({ where: { id } });
    else if (entity === "programs") await prisma.program.delete({ where: { id } });
    else if (entity === "units") await prisma.unit.delete({ where: { id } });
    else if (entity === "academic-years") await prisma.academicYear.delete({ where: { id } });
    else return NextResponse.json({ error: "Unsupported taxonomy entity." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "This item is still in use. Reassign dependent records before deleting it." }, { status: 409 });
  }
}
