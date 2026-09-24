import { CalendarDays, Download, Eye, FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { ResourceSearchResult } from "@/services/search/types";
import { formatBytes } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";

type Props = {
  resource: ResourceSearchResult & { detailUrl?: string; downloadUrl?: string };
};

export function ResourceCard({ resource }: Props) {
  const FileIcon = resource.fileType.includes("pdf") ? FileText : resource.fileType.includes("presentation") ? Presentation : resource.fileType.includes("spreadsheet") ? FileSpreadsheet : resource.fileType.startsWith("image/") ? FileImage : FileArchive;
  const uploadedDate = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(resource.createdAt));

  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-spruce transition group-hover:bg-spruce group-hover:text-white">
          <FileIcon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{resource.unit.code}</span>
            <span>{resource.resourceType.name}</span>
            <span>{resource.academicYear.label}</span>
            {resource.semester ? <span>{resource.semester.name}</span> : null}
          </div>
          <h3 className="mt-1 text-base font-semibold text-ink">{resource.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{resource.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{resource.school.name}</span>
            <span>{formatBytes(resource.fileSizeBytes)}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {uploadedDate}</span>
            <span className="inline-flex items-center gap-1"><Download size={14} /> {resource.downloadCount}</span>
            <span className="inline-flex items-center gap-1"><Eye size={14} /> {resource.viewCount}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href={resource.detailUrl ?? `/resources/${resource.id}`} variant="secondary">Open</ButtonLink>
        <ButtonLink href={resource.downloadUrl ?? `/api/resources/${resource.id}/download`} variant="primary">Download</ButtonLink>
        <BookmarkButton resourceId={resource.id} />
      </div>
    </article>
  );
}
