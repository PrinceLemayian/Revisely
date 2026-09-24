import { NextRequest } from "next/server";

export function enforceSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const expected = `${request.nextUrl.protocol}//${request.headers.get("host")}`;
  if (origin !== expected) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  return null;
}
