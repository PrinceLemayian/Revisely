CREATE TYPE "UserRole" AS ENUM ('student', 'admin');
CREATE TYPE "ResourceStatus" AS ENUM ('draft', 'published');
CREATE TYPE "AccessAction" AS ENUM ('view', 'download');
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

CREATE TABLE "schools" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "departments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "school_id" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("school_id", "code")
);

CREATE TABLE "programs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "department_id" TEXT NOT NULL REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("department_id", "code")
);

CREATE TABLE "units" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "program_id" TEXT NOT NULL REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "resource_types" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE "academic_years" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "label" TEXT NOT NULL UNIQUE
);

CREATE TABLE "semesters" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'student',
  "school_id" TEXT REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "program_id" TEXT REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "resources" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "unit_id" TEXT NOT NULL REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "resource_type_id" TEXT NOT NULL REFERENCES "resource_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "academic_year_id" TEXT NOT NULL REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "semester_id" TEXT REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "storage_key" TEXT NOT NULL UNIQUE,
  "file_name" TEXT NOT NULL,
  "file_type" TEXT NOT NULL,
  "file_size_bytes" INTEGER NOT NULL,
  "uploaded_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "status" "ResourceStatus" NOT NULL DEFAULT 'draft',
  "download_count" INTEGER NOT NULL DEFAULT 0,
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "search_vector" tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED
);

CREATE TABLE "bookmarks" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "resource_id" TEXT NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("user_id", "resource_id")
);

CREATE TABLE "resource_access_log" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "resource_id" TEXT NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "action" "AccessAction" NOT NULL,
  "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "chat_conversations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "chat_messages" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversation_id" TEXT NOT NULL REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "role" "ChatRole" NOT NULL,
  "content" TEXT NOT NULL,
  "retrieved_resource_ids" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "resources_unit_type_year_idx" ON "resources"("unit_id", "resource_type_id", "academic_year_id");
CREATE INDEX "resources_status_created_idx" ON "resources"("status", "created_at");
CREATE INDEX "resources_search_vector_idx" ON "resources" USING GIN ("search_vector");
CREATE INDEX "resource_access_resource_time_idx" ON "resource_access_log"("resource_id", "accessed_at");
