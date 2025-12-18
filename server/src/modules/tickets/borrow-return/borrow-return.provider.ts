import { BorrowReturnRepository } from "./borrow-return.repository.js";
import { BorrowReturnService } from "./borrow-return.service.js";

export const borrowReturnRepository = new BorrowReturnRepository();
export const borrowReturnService = new BorrowReturnService(borrowReturnRepository);
