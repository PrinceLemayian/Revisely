import { NextRequest, NextResponse } from "next/server";
import { searchQuerySchema } from "@/lib/validation";
import { getSearchService } from "@/services/search/postgres-search-service";

export async function GET(request: NextRequest) {
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid search input.", details: parsed.error.flatten() }, { status: 400 });
  const { q, ...filters } = parsed.data;
  const search = getSearchService();
  return NextResponse.json(await search.search(q, filters));
}
