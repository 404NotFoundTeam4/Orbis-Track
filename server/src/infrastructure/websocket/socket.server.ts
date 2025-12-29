import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";

let io: SocketIOServer | null = null;

/**
 * Description: เริ่มต้นการทำงาน Socket.IO, ตั้งค่า CORS, Middleware และจัดการ Room เมื่อ User เชื่อมต่อ
 * Input : httpServer (HttpServer)
 * Output : SocketIOServer
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const user = socket.user;
    console.log(`User connected: ${user?.sub}`);

    // Join Room อัตโนมัติ
    socket.join(`user_${user?.sub}`);
    if (user?.role) {
      socket.join(`role_${user?.role}_${user?.dept}_${user?.sec}`);
    }

    socket.on("disconnect", () => {
      console.log("User disconnected");
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
