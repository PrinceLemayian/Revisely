import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/revisely?schema=public"),
  AUTH_SECRET: z.string().min(24).default("development-secret-change-me-now"),
  STORAGE_PROVIDER: z.enum(["local", "s3", "supabase"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("resources"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(15 * 1024 * 1024),
  AI_PROVIDER: z.enum(["demo", "openai", "groq"]).default("demo"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
  GROQ_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  GROQ_TOP_P: z.coerce.number().min(0).max(1).default(1),
  GROQ_REASONING_EFFORT: z.enum(["low", "medium", "high"]).optional(),
  GROQ_STREAM: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  MAX_UPLOAD_BYTES: process.env.MAX_UPLOAD_BYTES,
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
  GROQ_TEMPERATURE: process.env.GROQ_TEMPERATURE,
  GROQ_MAX_TOKENS: process.env.GROQ_MAX_TOKENS,
  GROQ_TOP_P: process.env.GROQ_TOP_P,
  GROQ_REASONING_EFFORT: process.env.GROQ_REASONING_EFFORT,
  GROQ_STREAM: process.env.GROQ_STREAM,
  APP_BASE_URL: process.env.APP_BASE_URL
});
