import pino from "pino";

import { env } from "./../config/env.js";

const isProd = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";

export const logger = pino({
    enabled: !isTest,
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isProd
        ? undefined
        : {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                singleLine: false,
                // ignore: "pid,hostname",
            },
        },

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "headers.authorization",
            "body.password",
            "body.token",
            'res.headers["set-cookie"]',
        ],
        remove: true,
    },
});
