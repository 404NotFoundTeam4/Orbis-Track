/*
  Warnings:

  - You are about to drop the column `afs_dept_id` on the `approval_flow_steps` table. All the data in the column will be lost.
  - You are about to drop the column `afs_role` on the `approval_flow_steps` table. All the data in the column will be lost.
  - You are about to drop the column `afs_sec_id` on the `approval_flow_steps` table. All the data in the column will be lost.
  - You are about to drop the `log_device_childs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `afs_pa_id` to the `approval_flow_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brts_pa_id` to the `borrow_return_ticket_stages` table without a default value. This is not possible if the table is not empty.
  - Made the column `de_sec_id` on table `devices` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `lbr_action` on the `log_borrow_returns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `li_action` on the `log_issues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "approval_flow_steps" DROP CONSTRAINT "approval_flow_steps_afs_dept_id_fkey";

-- DropForeignKey
ALTER TABLE "approval_flow_steps" DROP CONSTRAINT "approval_flow_steps_afs_sec_id_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_de_sec_id_fkey";

-- DropForeignKey
ALTER TABLE "log_device_childs" DROP CONSTRAINT "log_device_childs_ldc_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "log_device_childs" DROP CONSTRAINT "log_device_childs_ldc_brt_id_fkey";

-- DropForeignKey
ALTER TABLE "log_device_childs" DROP CONSTRAINT "log_device_childs_ldc_dec_id_fkey";

-- DropForeignKey
ALTER TABLE "log_device_childs" DROP CONSTRAINT "log_device_childs_ldc_ti_id_fkey";

-- DropIndex
DROP INDEX "idx_steps_flow_step";

-- AlterTable
ALTER TABLE "approval_flow_steps" DROP COLUMN "afs_dept_id",
DROP COLUMN "afs_role",
DROP COLUMN "afs_sec_id",
ADD COLUMN     "afs_pa_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "borrow_return_ticket_stages" ADD COLUMN     "brts_pa_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "de_sec_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "log_borrow_returns" DROP COLUMN "lbr_action",
ADD COLUMN     "lbr_action" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "log_issues" DROP COLUMN "li_action",
ADD COLUMN     "li_action" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "ticket_issues" ALTER COLUMN "ti_description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "us_pa_id" INTEGER;

-- DropTable
DROP TABLE "log_device_childs";

-- DropEnum
DROP TYPE "LBR_ACTION";

-- DropEnum
DROP TYPE "LDC_ACTION";

-- DropEnum
DROP TYPE "LI_ACTION";

-- CreateTable
CREATE TABLE "approval_positions" (
    "ap_id" SERIAL NOT NULL,
    "ap_name" VARCHAR(200) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "approval_positions_pkey" PRIMARY KEY ("ap_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "approval_positions_ap_name_key" ON "approval_positions"("ap_name");

-- CreateIndex
CREATE INDEX "idx_steps_flow_step" ON "approval_flow_steps"("afs_af_id", "afs_pa_id", "afs_step_approve");

-- CreateIndex
CREATE INDEX "idx_users_position" ON "users"("us_pa_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_us_pa_id_fkey" FOREIGN KEY ("us_pa_id") REFERENCES "approval_positions"("ap_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_de_sec_id_fkey" FOREIGN KEY ("de_sec_id") REFERENCES "sections"("sec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "approval_flow_steps_afs_pa_id_fkey" FOREIGN KEY ("afs_pa_id") REFERENCES "approval_positions"("ap_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_pa_id_fkey" FOREIGN KEY ("brts_pa_id") REFERENCES "approval_positions"("ap_id") ON DELETE RESTRICT ON UPDATE CASCADE;
