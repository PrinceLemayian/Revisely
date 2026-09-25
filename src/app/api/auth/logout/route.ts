import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { enforceSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
