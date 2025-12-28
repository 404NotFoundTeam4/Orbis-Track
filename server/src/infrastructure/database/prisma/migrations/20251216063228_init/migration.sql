/*
  Warnings:

  - You are about to drop the column `recive_at` on the `ticket_issues` table. All the data in the column will be lost.
  - Added the required column `brts_role` to the `borrow_return_ticket_stages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "borrow_return_ticket_stages" ADD COLUMN     "brts_dept_id" INTEGER,
ADD COLUMN     "brts_dept_name" VARCHAR(200),
ADD COLUMN     "brts_role" "US_ROLE" NOT NULL,
ADD COLUMN     "brts_sec_id" INTEGER,
ADD COLUMN     "brts_sec_name" VARCHAR(200);

-- AlterTable
ALTER TABLE "ticket_issues" DROP COLUMN "recive_at",
ADD COLUMN     "receive_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "idx_brts_pending_lookup" ON "borrow_return_ticket_stages"("brts_status", "brts_role", "brts_dept_id", "brts_sec_id");

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_dept_id_fkey" FOREIGN KEY ("brts_dept_id") REFERENCES "departments"("dept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow_return_ticket_stages" ADD CONSTRAINT "borrow_return_ticket_stages_brts_sec_id_fkey" FOREIGN KEY ("brts_sec_id") REFERENCES "sections"("sec_id") ON DELETE SET NULL ON UPDATE CASCADE;
