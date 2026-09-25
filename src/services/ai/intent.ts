import { ResourceFilters } from "@/services/search/types";

const typeKeywords: Record<string, string[]> = {
  "lecture-notes": ["lecture note", "notes", "slides"],
  "past-papers": ["past paper", "exam", "examination"],
  cats: ["cat", "continuous assessment", "quiz"],
  assignments: ["assignment", "homework"],
  "revision-materials": ["revision", "revise"],
  handouts: ["handout"],
  "study-guides": ["study guide", "guide"]
};

export function extractIntent(message: string): { query: string; filters: ResourceFilters } {
  const lower = message.toLowerCase();
  const filters: ResourceFilters = {};
  const courseCode = message.match(/\b([a-z]{2,4})[\s-]?(\d{3,4})\b/i);
  if (courseCode) filters.unitCode = `${courseCode[1]}${courseCode[2]}`.toUpperCase();

  const year = message.match(/\b(20\d{2})(?:\/(20\d{2}))?\b/);
  if (year) filters.year = year[2] ? `${year[1]}/${year[2]}` : `${year[1]}/${Number(year[1]) + 1}`;

  const semester = lower.match(/semester\s*(1|2)|sem\s*(1|2)/);
  if (semester) filters.semester = `Semester ${semester[1] ?? semester[2]}`;

  for (const [slug, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      filters.type = slug;
      break;
    }
  }

  const cleaned = message
    .replace(/\b(do you have|i want to|i need|looking for|find|show me|please|resources?|materials?|for|from|a|an|the|papers?)\b/gi, " ")
    .replace(/\b(20\d{2})(?:\/(20\d{2}))?\b/g, " ")
    .replace(/\bsemester\s*(1|2)|sem\s*(1|2)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { query: cleaned || message, filters };
}
