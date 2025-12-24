import { Router } from "../../../core/router.js";
import { idParamSchema } from "../../departments/departments.schema.js";
import { BorrowReturnController } from "./borrow-return.controller.js";
import {
  getBorrowTicketQuery,
  ticketItemSchema,
  borrowReturnTicketDetailSchema,
  approveTicket,
} from "./borrow-return.schema.js";

import { borrowReturnService } from "./borrow-return.provider.js";

const borrowReturnController = new BorrowReturnController(borrowReturnService);
const router = new Router(undefined, "/tickets/borrow-return");

router.getDoc(
  "/",
  {
    tag: "Borrow Return",
    query: getBorrowTicketQuery,
    res: ticketItemSchema,
    auth: true,
  },
  borrowReturnController.getBorrowReturnTicket,
);

router.getDoc(
  "/:id",
  {
    tag: "Borrow Return",
    params: idParamSchema,
    res: borrowReturnTicketDetailSchema,
    auth: true,
  },
  borrowReturnController.getBorrowReturnTicketById,
);

router.patchDoc(
  "/:id/approve",
  {
    tag: "Borrow Return",
    params: idParamSchema,
    body: approveTicket,
    // res: borrowReturnTicketDetailSchema,
    auth: true,
  },
  borrowReturnController.approveTicketById,
);

export default router.instance;
