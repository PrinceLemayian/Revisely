-- DropIndex
DROP INDEX "resources_search_vector_idx";

-- AlterTable
ALTER TABLE "chat_conversations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "departments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "programs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "resources" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "search_vector" DROP EXPRESSION;

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "units" ALTER COLUMN "updated_at" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "resource_access_resource_time_idx" RENAME TO "resource_access_log_resource_id_accessed_at_idx";

-- RenameIndex
ALTER INDEX "resources_status_created_idx" RENAME TO "resources_status_created_at_idx";

-- RenameIndex
ALTER INDEX "resources_unit_type_year_idx" RENAME TO "resources_unit_id_resource_type_id_academic_year_id_idx";
