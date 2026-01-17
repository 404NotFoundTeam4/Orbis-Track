/**
 * Description: Socket.IO Server สำหรับ Real-time Communication
 * - จัดการ Authentication ผ่าน JWT Middleware
 * - Auto-join Room ตาม User และ Role
 * Input : HttpServer
 * Output : SocketIOServer instance
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { logger } from "../logger.js";

let io: SocketIOServer | null = null;

/**
 * Description: เริ่มต้นการทำงาน Socket.IO, ตั้งค่า CORS, Middleware และจัดการ Room เมื่อ User เชื่อมต่อ
 * Input : httpServer (HttpServer)
 * Output : SocketIOServer
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"], // fallback support
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const user = socket.user;
    logger.info({ userId: user?.sub }, "User connected");

    // Join Room อัตโนมัติ
    socket.join(`user_${user?.sub}`);
    if (user?.role) {
      if (user.role === "HOD") socket.join(`role_${user?.role}_${user?.dept}`);
      socket.join(`role_${user?.role}_${user?.dept}_${user?.sec}`);
      logger.debug(
        { userId: user.sub, role: user.role, dept: user.dept, sec: user.sec },
        "User joined rooms",
      );
    }

    // For Testing: Echo notification back to sender
    socket.on("TEST_NOTIFICATION", (payload) => {
      socket.emit("NEW_NOTIFICATION", payload);
    });

    socket.on("disconnect", () => {
      logger.info("User disconnected");
    });
  });

  return io;
};

/**
 * Description: ดึง Instance ของ Socket.IO เพื่อนำไปใช้ส่ง Event ในไฟล์อื่น (Singleton Pattern)
 * Input : -
 * Output : SocketIOServer
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
// Function สำหรับดึง IO ไปใช้ (ถ้าจำเป็น)
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
