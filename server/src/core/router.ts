/**
 * Description: ตัวช่วยทำ Router แบบมีมาตรฐานเดียวกัน + จัดการ async error ให้
 * Input : Express Request/Response/Next + handler ที่คืน BaseResponse (หรือ Promise)
 * Output : ส่ง JSON ตามโครงสร้าง BaseResponse ออกไปเสมอ และโยน error เข้า next() อัตโนมัติ
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import { BaseResponse } from './base.response.js';
import { MaybePromise } from '../types/types.js';
import { z, type ZodTypeAny } from "zod";
import { registry } from "../docs/swagger.js";

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => MaybePromise<BaseResponse>;
type Doc = {
    tag?: string;          // ชื่อแท็ก เช่น "Auth"
    auth?: boolean;        // ต้อง Bearer ไหม
    body?: ZodTypeAny;     // zod ของ request body
    res?: ZodTypeAny;      // zod ของ data (จะถูกห่อ BaseResponse ให้)
    params?: ZodTypeAny;   // zod ของ path params
    query?: ZodTypeAny;    // zod ของ query
    headers?: ZodTypeAny;
};

export const catchAsync =
    (fn: (...args: any[]) => any) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch((err) => next(err));
        };

function registerDoc(method: "get" | "post" | "put" | "patch" | "delete", path: string, d?: Doc) {
    if (!d) return;
    const content = (s?: ZodTypeAny) => s ? { "application/json": { schema: s } } : undefined;
    const base = (s?: ZodTypeAny) =>
    ({
        "application/json": {
            schema: s
                ? z.object({ success: z.boolean().optional(), message: z.string(), data: s.optional() })
                : z.object({ success: z.boolean().optional(), message: z.string() })
        }
    });

    const req: any = {};
    if (d.params) req.params = d.params;
    if (d.query) req.query = d.query;
    if (d.headers) req.headers = d.headers;
    if (d.body) req.body = { required: true, content: content(d.body) };

    registry.registerPath({
        method, path,
        tags: d.tag ? [d.tag] : undefined,
        security: d.auth ? [{ BearerAuth: [] }] : undefined,
        request: req as any,
        responses: { 200: { description: "OK", content: base(d.res) } },
    });
}

// คลาส Router ที่หุ้ม express.Router อีกทีให้โค้ดอ่านง่ายและ return รูปแบบเดียวกันทุก endpoint
export class Router {
    constructor(public readonly instance: express.Router = express.Router()) { }

    private extractHandlers(handlers: RequestHandler[]) {
        const handler = handlers[handlers.length - 1];
        const middlewares = handlers.slice(0, handlers.length - 1);
        return { handler, middlewares };
    }

    private preRequest(handler: RequestHandler) {
        const invokeHandler = async (req: Request, res: Response, next: NextFunction) => {
            const result = await handler(req, res, next);
            return res.send({
                success: true,
                message: 'Request successful',
                ...result,
            } satisfies BaseResponse);
        }
        return catchAsync(invokeHandler);
    }

    get(path: string, ...handlers: RequestHandler[]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).get(middlewares, this.preRequest(handler));
    }

    post(path: string, ...handlers: RequestHandler[]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).post(middlewares, this.preRequest(handler));
    }

    put(path: string, ...handlers: RequestHandler[]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).put(middlewares, this.preRequest(handler));
    }

    patch(path: string, ...handlers: RequestHandler[]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).patch(middlewares, this.preRequest(handler));
    }

    delete(path: string, ...handlers: RequestHandler[]) {
        const { handler, middlewares } = this.extractHandlers(handlers);
        this.instance.route(path).delete(middlewares, this.preRequest(handler));
    }

    //============================= Swagger Doc ===============================//
    getDoc(path: string, doc: Doc, ...handlers: RequestHandler[]) {
        registerDoc("get", path, doc);
        this.get(path, ...handlers);
    }
    postDoc(path: string, doc: Doc, ...handlers: RequestHandler[]) {
        registerDoc("post", path, doc);
        this.post(path, ...handlers);
    }
    putDoc(path: string, doc: Doc, ...handlers: RequestHandler[]) {
        registerDoc("put", path, doc);
        this.put(path, ...handlers);
    }
    patchDoc(path: string, doc: Doc, ...handlers: RequestHandler[]) {
        registerDoc("patch", path, doc);
        this.patch(path, ...handlers);
    }
    deleteDoc(path: string, doc: Doc, ...handlers: RequestHandler[]) {
        registerDoc("delete", path, doc);
        this.delete(path, ...handlers);
    }
}