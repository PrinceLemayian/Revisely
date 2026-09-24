"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  uploadedBy: { name: string; email?: string };
  unit: { code: string; name: string; program: { department: { school: { name: string } } } };
};

export function AdminReviewQueue({ submissions }: { submissions: Submission[] }) {
  const [items, setItems] = useState(submissions);
  const [message, setMessage] = useState("");

  async function review(id: string, action: "approve" | "reject") {
    setMessage("Saving review...");
    const response = await fetch(`/api/resources/${id}`, {
      method: action === "approve" ? "PATCH" : "DELETE",
      headers: action === "approve" ? { "Content-Type": "application/json" } : undefined,
      body: action === "approve" ? JSON.stringify({ status: "published" }) : undefined
    });
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setMessage(json?.error ?? "Could not save the review.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage(action === "approve" ? "Submission approved and published." : "Submission rejected and removed.");
  }

  if (!items.length) return <p className="rounded-lg bg-white p-5 text-sm text-slate-600">No student submissions are waiting for review.</p>;

  return (
    <div className="grid gap-4">
      {items.map((submission) => (
        <article key={submission.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-ink">{submission.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{submission.unit.code} · {submission.unit.name} · {submission.unit.program.department.school.name}</p>
              <p className="mt-2 text-sm text-slate-700">{submission.description}</p>
              <p className="mt-2 text-xs text-slate-500">{submission.fileName} · Submitted by {submission.uploadedBy.name}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" onClick={() => review(submission.id, "approve")}><Check size={16} /> Approve</Button>
              <Button type="button" variant="secondary" onClick={() => review(submission.id, "reject")}><Trash2 size={16} /> Reject</Button>
            </div>
          </div>
        </article>
      ))}
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
