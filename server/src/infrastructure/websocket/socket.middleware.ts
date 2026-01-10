import { Socket } from "socket.io";
import { verifyToken } from "../../utils/jwt.js";
import { logger } from "../logger.js";

declare module "socket.io" {
  interface Socket {
    user?: {
      sub: number;
      role: string;
      dept: number | null;
      sec: number | null;
    };
  }
}

/**
 * Description: Middleware ตรวจสอบ Token ของ Socket.IO ก่อนเชื่อมต่อ และแนบข้อมูล User เข้ากับ Socket
 * Input : socket (Socket), next (Function)
 * Output : void
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    // ดึง token ที่แนบมาจาก client ผ่าน socket
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const decoded = verifyToken(cleanToken);

    if (!decoded) {
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.user = decoded;

    next();
  } catch (error) {
    logger.error({ err: error }, "Socket Auth Error");
    next(new Error("Authentication error: Internal Error"));
  }
};
