import { AssistantChat } from "@/components/assistant-chat";
import { requireUser } from "@/lib/auth";

type Props = { searchParams: Promise<{ question?: string }> };

export default async function AssistantPage({ searchParams }: Props) {
  await requireUser();
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">AI assistant</h1>
      <p className="mt-2 text-slate-600">Every answer starts with database retrieval, and every link comes from a retrieved resource card.</p>
      <div className="mt-6"><AssistantChat initialQuestion={params.question ?? ""} /></div>
    </main>
  );
}
