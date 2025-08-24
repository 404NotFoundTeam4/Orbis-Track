export class HttpError extends Error {
    constructor(
        public status = 500,
        message = "Internal Server Error",
        public details?: unknown
    ) {
        super(message);
    }
}

export function httpError(status: number, message: string, details?: unknown): never {
    throw new HttpError(status, message, details);
}
