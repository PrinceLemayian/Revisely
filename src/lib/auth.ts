import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { cache } from "react";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";

export const SESSION_COOKIE = "revisely_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  schoolId: string | null;
};

function sign(value: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

export function createSessionToken(userId: string) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const nonce = randomBytes(12).toString("base64url");
  const payload = `${userId}.${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const payload = parts.slice(0, 3).join(".");
  const expected = sign(payload);
  const actual = parts[3];
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(actual);
  if (expectedBytes.length !== actualBytes.length) return null;
  if (!timingSafeEqual(expectedBytes, actualBytes)) return null;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { userId: parts[0] };
}

export async function getSessionUserFromToken(token?: string | null): Promise<SessionUser | null> {
  const parsed = parseSessionToken(token);
  if (!parsed) return null;
  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, name: true, email: true, role: true, schoolId: true }
  });
  return user;
}

// Reuse the authenticated user across the header, layout, and page render.
export const getSessionUser = cache(async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return getSessionUserFromToken(cookieStore.get(SESSION_COOKIE)?.value);
});

export async function getRequestUser(request: NextRequest): Promise<SessionUser | null> {
  return getSessionUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function requireApiUser(request: NextRequest): Promise<SessionUser | Response> {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  return user;
}

export async function requireApiAdmin(request: NextRequest): Promise<SessionUser | Response> {
  const userOrResponse = await requireApiUser(request);
  if (userOrResponse instanceof Response) return userOrResponse;
  if (userOrResponse.role !== "admin") {
    return Response.json({ error: "Admin access is required." }, { status: 403 });
  }
  return userOrResponse;
}
