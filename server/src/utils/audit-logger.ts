import { Prisma, PrismaClient } from "@prisma/client";
import {
  LogBorrowReturnInput,
  LogIssueInput,
  LogDeviceChildInput,
} from "./audit-logger.schema.js";

// กำหนด Type เพื่อให้รับได้ทั้ง PrismaClient (ใช้ปกติ) และ TransactionClient (ใช้ใน $transaction)
type DbClient = PrismaClient | Prisma.TransactionClient;

export const auditLogger = {
  async logBorrowReturn(tx: DbClient, data: LogBorrowReturnInput) {
    return tx.log_borrow_returns.create({
      data: {
        lbr_action: data.action,
        lbr_brt_id: data.brtId,
        lbr_actor_id: data.actorId,
        lbr_old_status: data.oldStatus,
        lbr_new_status: data.newStatus,
        lbr_note: data.note,
      },
    });
  },

  async logIssue(tx: DbClient, data: LogIssueInput) {
    return tx.log_issues.create({
      data: {
        li_action: data.action,
        li_ti_id: data.tiId,
        li_actor_id: data.actorId,
        li_old_status: data.oldStatus,
        li_new_status: data.newStatus,
        li_note: data.note,
      },
    });
  },

  async logDeviceHistory(tx: DbClient, data: LogDeviceChildInput) {
    return tx.log_device_childs.create({
      data: {
        ldc_action: data.action,
        ldc_dec_id: data.decId,
        ldc_actor_id: data.actorId,
        ldc_brt_id: data.brtId ?? null,
        ldc_ti_id: data.tiId ?? null,
        ldc_old_status: data.oldStatus,
        ldc_new_status: data.newStatus,
        ldc_note: data.note,
      },
    });
  },
};
