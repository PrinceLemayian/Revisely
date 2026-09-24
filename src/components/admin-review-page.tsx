"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarDays, Check, Eye, FileText, Flag, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReviewStatus = "pending" | "approved" | "rejected" | "flagged";

type ReviewResource = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  storageKey: string;
  createdAt: string;
  reviewStatus: ReviewStatus;
  reviewReason: string | null;
  uploadedBy: { name: string | null };
  unit: {
    code: string;
    name: string;
    program: { department: { school: { name: string } } };
  };
  resourceType: { name: string };
};

type Action = "reject" | "flag";

const tabs: { id: ReviewStatus; label: string }[] = [
  { id: "pending", label: "Pending review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "flagged", label: "Flagged" }
];

function fileUrl(storageKey: string) {
  return `/api/files/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminReviewPage({ initialResources }: { initialResources: ReviewResource[] }) {
  const [resources, setResources] = useState(initialResources);
  const [activeTab, setActiveTab] = useState<ReviewStatus>("pending");
  const [selected, setSelected] = useState<ReviewResource | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleResources = useMemo(() => resources.filter((resource) => resource.reviewStatus === activeTab), [activeTab, resources]);

  async function review(resource: ReviewResource, nextAction: "approve" | Action, reviewReason?: string) {
    setBusyId(resource.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/resources/${resource.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction, reason: reviewReason || undefined })
      });
      if (!response.ok) throw new Error("The review action could not be completed.");
      const updated = await response.json();
      setResources((current) => current.map((item) => item.id === resource.id ? { ...item, reviewStatus: updated.reviewStatus, reviewReason: updated.reviewReason } : item));
      if (selected?.id === resource.id) setSelected(null);
      setAction(null);
      setReason("");
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "The review action could not be completed.");
    } finally {
      setBusyId(null);
    }
  }

  function submitAction() {
    if (!selected || !action) return;
    if (action === "reject" && !window.confirm("Reject this resource? It will remain recorded but will not be visible to students.")) return;
    void review(selected, action, reason.trim());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-spruce">Catalog trust</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Pending review</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Check student uploads before they reach the shared resource library.</p>
        </div>
        <div className="rounded-lg bg-mint px-4 py-3 text-sm text-spruce"><strong>{resources.filter((item) => item.reviewStatus === "pending").length}</strong> resources need attention</div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Resource review status">
        {tabs.map((tab) => {
          const count = resources.filter((resource) => resource.reviewStatus === tab.id).length;
          return <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === tab.id ? "border-spruce text-spruce" : "border-transparent text-slate-500 hover:text-ink"}`}>{tab.label} <span className="ml-1 text-xs text-slate-400">{count}</span></button>;
        })}
      </div>

      {error ? <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="mt-5 grid gap-4">
        {visibleResources.map((resource) => <article key={resource.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-spruce"><FileText size={20} /></span>
                <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-ink">{resource.title}</h2><p className="mt-1 text-sm text-slate-500">{resource.description || resource.fileName}</p></div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                <span className="flex items-center gap-2"><UserRound size={15} />{resource.uploadedBy.name || "Unknown uploader"}</span>
                <span className="flex items-center gap-2"><FileText size={15} />{resource.unit.code} · {resource.resourceType.name}</span>
                <span className="flex items-center gap-2"><Building2 size={15} />{resource.unit.program.department.school.name}</span>
                <span className="flex items-center gap-2"><CalendarDays size={15} />{formatDate(resource.createdAt)}</span>
              </div>
              {resource.reviewReason ? <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"><strong>Note:</strong> {resource.reviewReason}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setSelected(resource)}><Eye size={16} /> Preview</Button>
              {activeTab === "pending" ? <><Button disabled={busyId === resource.id} onClick={() => void review(resource, "approve")}><Check size={16} /> Approve</Button><Button variant="danger" disabled={busyId === resource.id} onClick={() => { setSelected(resource); setAction("reject"); }}><X size={16} /> Reject</Button><Button variant="secondary" disabled={busyId === resource.id} onClick={() => { setSelected(resource); setAction("flag"); }}><Flag size={16} /> Flag</Button></> : null}
            </div>
          </div>
        </article>)}
        {visibleResources.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"><h2 className="font-semibold text-ink">Nothing here yet</h2><p className="mt-1 text-sm text-slate-500">Resources will appear in this tab as they move through review.</p></div> : null}
      </div>

      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label="Resource preview">
        <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-ink">{selected.title}</h2><p className="text-xs text-slate-500">{selected.fileName}</p></div><button className="focus-ring rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => { setSelected(null); setAction(null); }} aria-label="Close preview"><X size={20} /></button></div>
          <div className="min-h-0 flex-1 bg-slate-100 p-3">{selected.fileType.toLowerCase().includes("pdf") || selected.fileName.toLowerCase().endsWith(".pdf") ? <iframe src={fileUrl(selected.storageKey)} title={`Preview of ${selected.title}`} className="h-[68vh] w-full rounded-lg border border-slate-200 bg-white" /> : <div className="grid h-[40vh] place-items-center text-center"><div><FileText className="mx-auto text-slate-400" size={40} /><p className="mt-3 text-sm text-slate-600">Inline preview is available for PDF files.</p><a className="mt-3 inline-block font-semibold text-spruce underline" href={fileUrl(selected.storageKey)} target="_blank" rel="noreferrer">Open file in a new tab</a></div></div>}</div>
          {action ? <div className="border-t border-slate-200 p-5"><label className="text-sm font-semibold text-ink" htmlFor="review-reason">{action === "reject" ? "Reason for rejection" : "Review note"} <span className="font-normal text-slate-500">(optional)</span></label><textarea id="review-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-spruce" placeholder="Add context for the uploader or the next reviewer" /><div className="mt-3 flex justify-end gap-2"><Button variant="secondary" onClick={() => setAction(null)}>Cancel</Button><Button variant={action === "reject" ? "danger" : "primary"} disabled={busyId === selected.id} onClick={submitAction}>{action === "reject" ? "Confirm rejection" : "Flag resource"}</Button></div></div> : null}
        </div>
      </div> : null}
    </div>
  );
}
