import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/errors.js';
import { BaseResponse } from '../core/base.response.js';

/**
 * Description: error middleware กลางของ Express จับทุกอย่างแล้วตอบเป็น BaseResponse ให้หน้าตาเหมือนกัน
 * Input : error, req, res<Response<BaseResponse>>, next
 * Output : JSON { message, success: false, data: null, traceStack? }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export function globalErrorHandler(
    error: unknown,
    request: Request,
    response: Response<BaseResponse>,
    next: NextFunction
) {
    let statusCode = 500;
    let message = '';


    // ถ้าเป็น HttpError ของเราเอง ดึง statusCode ที่โยนมาใช้เลย
    if (error instanceof HttpError) {
        statusCode = error.statusCode;
    }

    if (error instanceof Error) {
        console.log(`${error.name}: ${error.message}`);
        message = error.message;
    } else {
        console.log('Unknown error');
        message = `An unknown error occurred, ${String(error)}`;
    }


    // ส่งรูปแบบตอบกลับมาตรฐาน ไม่สำเร็จ, data เป็น null
    // traceStack โชว์เฉพาะตอน development กันข้อมูลหลุดใน prod
    response.status(statusCode).send({
        message,
        success: false,
        data: null,
        traceStack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
}