import { Router } from "../../../core/router.js";
import { idParamSchema } from "../../departments/departments.schema.js";
import { BorrowReturnController } from "./borrow-return.controller.js";
import {
  availableDeviceChildsSchema,
  getBorrowTicketQuery,
  getDeviceAvailableQuery,
  rejectTicket,
  ticketItemSchema,
  borrowReturnTicketDetailSchema,
  approveTicket,
  updateDeviceChildInTicket,
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
  "/device-available",
  {
    tag: "Borrow Return",
    query: getDeviceAvailableQuery,
    res: availableDeviceChildsSchema,
    auth: true,
  },
  borrowReturnController.getDeviceAvailable,
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

router.patchDoc(
  "/:id/reject",
  {
    tag: "Borrow Return",
    params: idParamSchema,
    body: rejectTicket,
    // res: borrowReturnTicketDetailSchema,
    auth: true,
  },
  borrowReturnController.rejectTicketById,
);

router.patchDoc(
  "/:id/manage-device-childs",
  {
    tag: "Borrow Return",
    params: idParamSchema,
    body: updateDeviceChildInTicket,
    // res: borrowReturnTicketDetailSchema,
    auth: true,
  },
  borrowReturnController.manageDeviceChildsInTicket,
);

export default router.instance;
