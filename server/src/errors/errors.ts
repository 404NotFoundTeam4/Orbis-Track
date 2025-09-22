import { HttpStatus } from "../core/http-status.enum.js";

export class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
        this.name = 'HttpError';
    }
}

export class ValidationError extends HttpError {
    constructor(public message: string) {
        super(HttpStatus.BAD_REQUEST, message);
        this.name = 'ValidationError';
    }
}