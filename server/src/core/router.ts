/**
 * Description: ตัวช่วยทำ Router แบบมีมาตรฐานเดียวกัน + จัดการ async error ให้
 * Input : Express Request/Response/Next + handler ที่คืน BaseResponse (หรือ Promise)
 * Output : ส่ง JSON ตามโครงสร้าง BaseResponse ออกไปเสมอ และโยน error เข้า next() อัตโนมัติ
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import type { BaseResponse } from "./base.response.js";
import type { MaybePromise } from "../types/types.js";
import type { PaginatedResult } from "./paginated-result.interface.js";
import { z, type ZodType } from "zod";
import { registry } from "../docs/swagger.js";


export type RequestHandler = (req: Request, res: Response, next: NextFunction) => MaybePromise<BaseResponse>;

// Supported content types
type ContentType = "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded";

type Doc = {
    tag?: string;          // ชื่อแท็ก เช่น "Auth"
    summary?: string;      // สรุปสั้นๆ แสดงข้างชื่อ endpoint
    description?: string;  // คำอธิบายละเอียด
    operationId?: string;  // ID ของ operation (optional)
    deprecated?: boolean;  // ถ้า true จะแสดงเป็น deprecated
    auth?: boolean;        // ต้อง Bearer ไหม
    body?: ZodType;        // zod ของ request body
    res?: ZodType;         // zod ของ data (จะถูกห่อ BaseResponse ให้)
    paginated?: boolean;   // ถ้า true จะใช้ PaginatedResponse wrapper แทน BaseResponse
    params?: ZodType;      // zod ของ path params
    query?: ZodType;       // zod ของ query
    headers?: ZodType;
    contentType?: ContentType | ContentType[];  // รองรับหลาย content types
};

const joinPath = (a = '', b = '') =>
    '/' + [a, b]
        .map(s => (s || '').replace(/(?:^\/+|\/+$)/g, ''))
        .filter(Boolean)
        .join('/');

export const catchAsync =
    (fn: (...args: any[]) => any) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch((err) => next(err));
        };

function registerDoc(method: "get" | "post" | "put" | "patch" | "delete", path: string, d?: Doc) {
    if (!d) return;

    const openapiPath = path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');

    // รองรับหลาย content types - form-urlencoded มาก่อนเพื่อให้เป็น default
    const contentTypes: ContentType[] = d.contentType
        ? (Array.isArray(d.contentType) ? d.contentType : [d.contentType])
        : ["application/x-www-form-urlencoded", "application/json"];  // form มาก่อน = default

    // สร้าง content object สำหรับหลาย content types
    const multiContent = (s?: ZodType) => {
        if (!s) return undefined;
        const result: Record<string, { schema: ZodType }> = {};
        for (const ct of contentTypes) {
            result[ct] = { schema: s };
        }
        return result;
    };

    // BaseResponse wrapper
    const base = (s?: ZodType) =>
    ({
        "application/json": {
            schema: s
                ? z.object({
                    success: z.boolean().optional().openapi({ description: "สถานะการทำงานสำเร็จหรือไม่", example: true }),
                    message: z.string().openapi({ description: "ข้อความตอบกลับ", example: "Request successful" }),
                    data: s.optional().openapi({ description: "ข้อมูลที่ส่งกลับ" })
                }).openapi({ description: "BaseResponse wrapper" })
                : z.object({
                    success: z.boolean().optional().openapi({ description: "สถานะการทำงานสำเร็จหรือไม่", example: true }),
                    message: z.string().openapi({ description: "ข้อความตอบกลับ", example: "Request successful" })
                }).openapi({ description: "BaseResponse wrapper" })
        }
    });

    // PaginatedResponse wrapper
    const paginatedBase = (s?: ZodType) =>
    ({
        "application/json": {
            schema: z.object({
                status: z.number().openapi({ description: "HTTP status code", example: 200 }),
                message: z.string().openapi({ description: "ข้อความตอบกลับ", example: "Request successful" }),
                totalNum: z.number().openapi({ description: "จำนวนข้อมูลทั้งหมด", example: 100 }),
                maxPage: z.number().openapi({ description: "จำนวนหน้าสูงสุด", example: 10 }),
                currentPage: z.number().openapi({ description: "หน้าปัจจุบัน", example: 1 }),
                data: s ? z.array(s).openapi({ description: "รายการข้อมูล" }) : z.array(z.unknown())
            }).openapi({ description: "PaginatedResponse wrapper" })
        }
    });

    const req: Record<string, unknown> = {};
    if (d.params) req.params = d.params;
    if (d.query) req.query = d.query;
    if (d.headers) req.headers = d.headers;
    if (d.body) req.body = { required: true, content: multiContent(d.body) };

    // เลือกใช้ base หรือ paginatedBase ตาม option
    const responseContent = d.paginated ? paginatedBase(d.res) : base(d.res);

    registry.registerPath({
        method,
        path: openapiPath,
        tags: d.tag ? [d.tag] : undefined,
        summary: d.summary,
        description: d.description,
        operationId: d.operationId,
        deprecated: d.deprecated,
        security: d.auth ? [{ BearerAuth: [] }] : undefined,
        request: req,
        responses: { 200: { description: d.summary || "Success", content: responseContent } },
    });
}

// คลาส Router ที่หุ้ม express.Router อีกทีให้โค้ดอ่านง่ายและ return รูปแบบเดียวกันทุก endpoint
export class Router {
    constructor(
        public readonly instance: express.Router = express.Router(),
        private readonly docPrefix = ""
    ) { }

    private extractHandlers(handlers: (express.RequestHandler | RequestHandler)[]) {
        const handler = handlers[handlers.length - 1] as RequestHandler;
        const middlewares = handlers.slice(0, -1) as express.RequestHandler[];
        return { handler, middlewares };
    }

    private preRequest(handler: RequestHandler) {
        const invokeHandler = async (req: Request, res: Response, next: NextFunction) => {
            const result = await handler(req, res, next);
            if (result && (result as PaginatedResult<any>).paginated) {
                const { data, total, page, limit, message } = result as PaginatedResult<any>;
                return res.json({
                    status: 200,
                    message: message ?? "Request successful",
                    totalNum: total,
                    maxPage: Math.ceil(total / limit),
                    currentPage: page,
                    data,
                });
            }

            return res.send({
                success: true,
                // message: 'Request successful',
                message: result?.message ?? "Request successful",
                ...result,
            } satisfies BaseResponse);
        }
        return catchAsync(invokeHandler);
    }

    get(path: string, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).get(...middlewares, this.preRequest(handler));
    }

    post(path: string, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).post(...middlewares, this.preRequest(handler));
    }

    put(path: string, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).put(...middlewares, this.preRequest(handler));
    }

    patch(path: string, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).patch(...middlewares, this.preRequest(handler));
    }

    delete(path: string, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).delete(...middlewares, this.preRequest(handler));
    }

    //============================= Swagger Doc ===============================//
    getDoc(path: string, doc: Doc, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        registerDoc("get", joinPath(this.docPrefix, path), doc);
        this.get(path, ...handlers);
    }
    postDoc(path: string, doc: Doc, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        registerDoc("post", joinPath(this.docPrefix, path), doc);
        this.post(path, ...handlers);
    }
    putDoc(path: string, doc: Doc, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        registerDoc("put", joinPath(this.docPrefix, path), doc);
        this.put(path, ...handlers);
    }
    patchDoc(path: string, doc: Doc, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        registerDoc("patch", joinPath(this.docPrefix, path), doc);
        this.patch(path, ...handlers);
    }
    deleteDoc(path: string, doc: Doc, ...handlers: [...express.RequestHandler[], RequestHandler]) {
        registerDoc("delete", joinPath(this.docPrefix, path), doc);
        this.delete(path, ...handlers);
    }
}