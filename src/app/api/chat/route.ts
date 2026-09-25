import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { chatRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { askAssistant } from "@/services/ai/assistant-service";
import { enforceSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const user = await requireApiUser(request);
  if (user instanceof Response) return user;
  const limited = checkRateLimit(`chat:${user.id}`, 20, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "The assistant is receiving too many requests. Try again shortly." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ask a shorter, specific academic resource question." }, { status: 400 });

  try {
    return NextResponse.json(await askAssistant(user.id, parsed.data.message, parsed.data.conversationId));
  } catch {
    return NextResponse.json({ error: "The assistant could not process that request right now." }, { status: 500 });
  }
}
