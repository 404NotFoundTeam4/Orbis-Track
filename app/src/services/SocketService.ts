/**
 * Description: Singleton Service สำหรับจัดการ Socket.IO Client
 * - connect(): เชื่อมต่อ Socket พร้อม JWT Auth
 * - disconnect(): ตัดการเชื่อมต่อ
 * - on/off/emit: Proxy methods สำหรับ Event handling
 * Input : Token จาก localStorage/sessionStorage
 * Output : Socket instance
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {
    // Private constructor ensures singleton
  }

  /**
   * Description: ดึง instance ของ SocketService (Singleton)
   * Input : -
   * Output : SocketService instance
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Description: เชื่อมต่อ Socket.IO พร้อม JWT Authentication
   * Input : url?: string (optional socket URL)
   * Output : Socket instance
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  public connect(url?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl =
      url ||
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://localhost:4041" : "");

    console.log("Connecting to socket at:", socketUrl);

    this.socket = io(socketUrl, {
      path: `${import.meta.env.NODE_ENV === "production" ? "/api/socket.io" : "/socket.io"}`,
      autoConnect: true,
      auth: (cb) => {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        cb({ token });
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("SocketService connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.error("SocketService connection error:", err.message);

      if (
        err.message === "jwt expired" ||
        err.message === "Socket Auth Error"
      ) {
        console.warn("Token might be expired. Please refresh token.");
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("SocketService disconnected:", reason);
    });

    return this.socket;
  }

  /**
   * Description: ตัดการเชื่อมต่อ Socket
   * Input : -
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Description: ดึง Socket instance ปัจจุบัน
   * Input : -
   * Output : Socket | null
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Proxy methods for convenience
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn("Socket not connected. Call connect() first.");
      // Optionally auto-connect here
      // this.connect();
    }
    this.socket?.on(event, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = SocketService.getInstance();
