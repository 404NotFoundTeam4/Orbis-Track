/**
 * Description: ตั้ง logger กลางด้วย pino — โปรดักชันเน้นเบา ๆ, dev อ่านง่ายด้วย pino-pretty + ซ่อนข้อมูลอ่อนไหว
 * Input : env.NODE_ENV, process.env.LOG_LEVEL
 * Output : ตัวแปร logger พร้อมใช้ (info ใน prod, debug ใน dev, ปิดใน test)
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import pino from "pino";
import { env } from "./../config/env.js";
import { pinoHttp } from "pino-http";

const isProd = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";

export const logger = pino({
    enabled: !isTest,
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    timestamp: pino.stdTimeFunctions.isoTime,

    // dev/locally ใช้ pino-pretty ให้สวยตา — prod ไม่ต้องประหยัด resource/IO
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
    base: { service: "orbis-track" },
    // กันหลุดข้อมูลสำคัญลง log ลิสต์ path ที่จะลบทิ้งออกไปเลย
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "headers.authorization",
            "req.body.password",
            "req.body.confirmPassword",
            "req.body.newPassword",
            "req.body.token",
            "req.body.refreshToken",
            'res.headers["set-cookie"]',
        ],
        remove: true,
    },
});

export const httpLogger = pinoHttp({
    logger,
    serializers: {
        req: (r) => ({ id: r.id, method: r.method, url: r.url }),
        res: (r) => ({ statusCode: r.statusCode }),
        err: (e) => ({ type: e.name, message: e.message, stack: e.stack }),
    },
    customLogLevel(_req, res, err) {
        if (err) return "error";
        if (res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
    customErrorMessage: (_req, res, _err) => `request failed (${res.statusCode})`,
    customSuccessMessage: (_req, res) => `request completed (${res.statusCode})`,
});
