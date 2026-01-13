import { getIO } from "./socket.server.js";
import { logger } from "../logger.js";

export const SocketEmitter = {
  /**
   * Description: ส่ง Event แจ้งเตือนผ่าน Socket ไปยังผู้ใช้รายบุคคล (ระบุด้วย UserId)
   * Input : userId (number), event (string), data (any)
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  // แจ้งเตือนรายคน
  toUser: (userId: number, event: string, data: any) => {
    try {
      getIO().to(`user_${userId}`).emit(event, data);
    } catch (e) {
      logger.error({ err: e }, "Socket emit error");
    }
  },

  /**
   * Description: ส่ง Event แจ้งเตือนผ่าน Socket ไปยังกลุ่มผู้ใช้ตาม Role
   * Input : { role: string, dept: number, sec?: number, event: string, data: any }
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  // แจ้งเตือนตาม Role
  toRole: (params: {
    role: string;
    dept: number;
    sec?: number;
    event: string;
    data: any;
  }) => {
    const { role, dept, sec, event, data } = params;
    try {
      // ถ้าไม่มี sec (เช่น HOD) ให้ใช้ชื่อห้องแบบไม่มี sec หรือใช้ 0 เป็น default
      const roomName = sec ? `role_${role}_${dept}_${sec}` : `role_${role}_${dept}`;
      // console.log(`Socket emitting to ${roomName}: ${event} with ticketId: ${data.ticketId}`);
      getIO().to(roomName).emit(event, data);
    } catch (e) {
      logger.error({ err: e }, "Socket emit error");
    }
  },
};
