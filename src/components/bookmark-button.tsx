"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

export function BookmarkButton({ resourceId }: { resourceId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Bookmark");

  async function toggle() {
    setBusy(true);
    const response = await fetch(saved ? `/api/bookmarks?resourceId=${resourceId}` : "/api/bookmarks", {
      method: saved ? "DELETE" : "POST",
      headers: saved ? undefined : { "Content-Type": "application/json" },
      body: saved ? undefined : JSON.stringify({ resourceId })
    });
    setBusy(false);
    if (response.status === 401) {
      setMessage("Sign in to save");
      return;
    }
    if (!response.ok) {
      setMessage("Try again");
      return;
    }
    setSaved(!saved);
    setMessage(saved ? "Bookmark" : "Saved");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-60"
      title={message}
      aria-label={message}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
