export type ResourceFilters = {
  unitCode?: string;
  unit?: string;
  type?: string;
  year?: string;
  semester?: string;
  school?: string;
  department?: string;
  sort?: "newest" | "downloads" | "alphabetical";
  page?: number;
  pageSize?: number;
};

export type ResourceSearchResult = {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSizeBytes: number;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
  unit: { id: string; name: string; code: string };
  resourceType: { name: string; slug: string };
  academicYear: { label: string };
  semester: { name: string } | null;
  program: { name: string };
  department: { name: string };
  school: { name: string };
};

export type SearchResponse = {
  results: ResourceSearchResult[];
  total: number;
  page: number;
  pageSize: number;
};

export interface SearchService {
  search(query: string, filters: ResourceFilters): Promise<SearchResponse>;
}
