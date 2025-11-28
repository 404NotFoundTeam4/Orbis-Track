import { getIO } from "./socket.server.js";

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
      console.error("Socket emit error:", e);
    }
  },

  /**
   * Description: ส่ง Event แจ้งเตือนผ่าน Socket ไปยังกลุ่มผู้ใช้ตาม Role
   * Input : role (string), event (string), data (any)
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  // แจ้งเตือนตาม Role
  toRole: (role: string, event: string, data: any) => {
    try {
      getIO().to(`role_${role}`).emit(event, data);
    } catch (e) {
      console.error("Socket emit error:", e);
    }
  },
};
