import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { enforceSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const limited = checkRateLimit(`register:${request.headers.get("x-forwarded-for") ?? "local"}`, 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many signup attempts. Try again soon." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the signup form.", details: parsed.error.flatten() }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: "student",
      schoolId: parsed.data.schoolId || undefined,
      programId: parsed.data.programId || undefined
    },
    select: { id: true, name: true, email: true, role: true }
  });

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
