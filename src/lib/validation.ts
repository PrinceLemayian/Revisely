import { z } from "zod";

export const resourceStatusSchema = z.enum(["draft", "published"]);

export const resourceCreateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(1200),
  unitId: z.string().min(1),
  resourceTypeId: z.string().min(1),
  academicYearId: z.string().min(1),
  semesterId: z.string().min(1).optional().nullable(),
  status: resourceStatusSchema.default("published")
});

export const resourceUpdateSchema = resourceCreateSchema.partial().extend({
  status: resourceStatusSchema.optional()
});

export const resourceReviewSchema = z.object({
  action: z.enum(["approve", "reject", "flag"]),
  reason: z.string().trim().max(500).optional()
});

export const searchQuerySchema = z.object({
  q: z.string().trim().default(""),
  unitCode: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  type: z.string().trim().optional(),
  year: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  school: z.string().trim().optional(),
  department: z.string().trim().optional(),
  sort: z.enum(["newest", "downloads", "alphabetical"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(100),
  role: z.enum(["student", "admin"]).default("student"),
  schoolId: z.string().optional(),
  programId: z.string().optional()
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(2).max(800),
  conversationId: z.string().optional()
});

export const taxonomyEntitySchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(24).optional(),
  parentId: z.string().optional(),
  description: z.string().max(500).optional()
});
