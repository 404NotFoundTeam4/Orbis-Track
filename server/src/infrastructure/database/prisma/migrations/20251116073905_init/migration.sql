/*
  Warnings:

  - You are about to drop the column `afs_pa_id` on the `approval_flow_steps` table. All the data in the column will be lost.
  - You are about to drop the column `brts_pa_id` on the `borrow_return_ticket_stages` table. All the data in the column will be lost.
  - You are about to drop the column `us_pa_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `approval_positions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `afs_role` to the `approval_flow_steps` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `lbr_action` on the `log_borrow_returns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `li_action` on the `log_issues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `ti_description` on table `ticket_issues` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "LDC_ACTION" AS ENUM ('BORROWED', 'RETURNED', 'CHANGED', 'RESOLVED', 'MARK_DAMAGED');

-- CreateEnum
CREATE TYPE "LBR_ACTION" AS ENUM ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'RETURNED', 'MARK_DAMAGED', 'MARK_LOST');

-- CreateEnum
CREATE TYPE "LI_ACTION" AS ENUM ('REPORTED', 'ASSIGNED', 'UPDATED', 'RESOLVED', 'MARK_DAMAGED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."approval_flow_steps" DROP CONSTRAINT "approval_flow_steps_afs_pa_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."borrow_return_ticket_stages" DROP CONSTRAINT "borrow_return_ticket_stages_brts_pa_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."devices" DROP CONSTRAINT "devices_de_sec_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sections" DROP CONSTRAINT "sections_sec_dept_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_us_pa_id_fkey";

-- DropIndex
DROP INDEX "public"."idx_steps_flow_step";

-- DropIndex
DROP INDEX "public"."idx_users_position";

-- AlterTable
ALTER TABLE "approval_flow_steps" DROP COLUMN "afs_pa_id",
ADD COLUMN     "afs_dept_id" INTEGER,
ADD COLUMN     "afs_role" "US_ROLE" NOT NULL,
ADD COLUMN     "afs_sec_id" INTEGER;

-- AlterTable
ALTER TABLE "borrow_return_ticket_stages" DROP COLUMN "brts_pa_id";

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "de_sec_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "log_borrow_returns" DROP COLUMN "lbr_action",
ADD COLUMN     "lbr_action" "LBR_ACTION" NOT NULL;

-- AlterTable
ALTER TABLE "log_issues" DROP COLUMN "li_action",
ADD COLUMN     "li_action" "LI_ACTION" NOT NULL;

-- AlterTable
ALTER TABLE "ticket_issues" ALTER COLUMN "ti_description" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "us_pa_id";

-- DropTable
DROP TABLE "public"."approval_positions";

-- CreateTable
CREATE TABLE "log_device_childs" (
    "ldc_id" SERIAL NOT NULL,
    "ldc_action" "LDC_ACTION" NOT NULL,
    "ldc_old_status" VARCHAR(50),
    "ldc_new_status" VARCHAR(50),
    "ldc_note" TEXT,
    "ldc_actor_id" INTEGER,
    "ldc_ti_id" INTEGER,
    "ldc_brt_id" INTEGER,
    "ldc_dec_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_device_childs_pkey" PRIMARY KEY ("ldc_id")
);

-- CreateIndex
CREATE INDEX "idx_ldc_log_issue" ON "log_device_childs"("ldc_ti_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_log_device_history" ON "log_device_childs"("ldc_dec_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_steps_flow_step" ON "approval_flow_steps"("afs_af_id", "afs_step_approve");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_sec_dept_id_fkey" FOREIGN KEY ("sec_dept_id") REFERENCES "departments"("dept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_sec_id_fkey" FOREIGN KEY ("de_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_dept_id_fkey" FOREIGN KEY ("afs_dept_id") REFERENCES "departments"("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_sec_id_fkey" FOREIGN KEY ("afs_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_actor_id_fkey" FOREIGN KEY ("ldc_actor_id") REFERENCES "users"("us_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_ti_id_fkey" FOREIGN KEY ("ldc_ti_id") REFERENCES "ticket_issues"("ti_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_brt_id_fkey" FOREIGN KEY ("ldc_brt_id") REFERENCES "borrow_return_tickets"("brt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_device_childs" ADD CONSTRAINT "log_device_childs_ldc_dec_id_fkey" FOREIGN KEY ("ldc_dec_id") REFERENCES "device_childs"("dec_id") ON DELETE SET NULL ON UPDATE CASCADE;
