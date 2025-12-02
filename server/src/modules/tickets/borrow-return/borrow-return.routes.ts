import { Router } from "../../../core/router.js";
import { idParamSchema } from "../../departments/departments.schema.js";
import { BorrowReturnController } from "./borrow-return.controller.js";
import {
  getBorrowTicketQuery,
  ticketItemSchema,
  borrowReturnTicketDetailSchema,
} from "./borrow-return.schema.js";

const borrowReturnController = new BorrowReturnController();
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

export default router.instance;
