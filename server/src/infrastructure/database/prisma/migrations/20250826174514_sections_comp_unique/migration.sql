-- DropIndex
DROP INDEX "public"."sections_name_key";

-- AlterTable
ALTER TABLE "public"."sections" ALTER COLUMN "name" SET DATA TYPE TEXT;
