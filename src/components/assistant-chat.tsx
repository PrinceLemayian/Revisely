"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RetrievedResource } from "@/services/ai/types";

type Message = {
  role: "user" | "assistant";
  content: string;
  resources?: RetrievedResource[];
};

export function AssistantChat({ initialQuestion = "" }: { initialQuestion?: string }) {
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    setValue("");
    setError("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: message }]);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversationId })
    });
    setLoading(false);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      setError(json?.error ?? "The assistant could not answer right now.");
      return;
    }
    setConversationId(json.conversationId);
    setMessages((current) => [...current, { role: "assistant", content: json.answer, resources: json.resources }]);
  }

  return (
    <div className="grid min-h-[680px] grid-rows-[1fr_auto] rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-teal-50 text-spruce"><Bot /></div>
              <h2 className="mt-4 text-xl font-semibold">Ask for a real resource</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">Try “Do you have a 2024 Database Systems past paper?” The assistant retrieves database rows before answering.</p>
            </div>
          </div>
        ) : null}
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "ml-auto max-w-2xl rounded-lg bg-spruce p-4 text-white" : "max-w-3xl rounded-lg bg-slate-50 p-4 text-ink"}>
            <p className="text-sm leading-6">{message.content}</p>
            {message.resources?.length ? (
              <div className="mt-3 grid gap-2">
                {message.resources.map((resource) => (
                  <Link key={resource.id} href={resource.detailUrl} className="rounded-md border border-slate-200 bg-white p-3 text-sm text-ink hover:border-spruce">
                    <span className="block font-semibold">{resource.title}</span>
                    <span className="text-xs text-slate-500">{resource.unit.code} · {resource.resourceType.name} · {resource.academicYear.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {loading ? <p className="text-sm text-slate-500">Searching the catalog...</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
      <form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4">
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask about a unit, paper, CAT, or year" />
        <Button type="submit" disabled={loading}><Send size={17} /> Send</Button>
      </form>
    </div>
  );
}
