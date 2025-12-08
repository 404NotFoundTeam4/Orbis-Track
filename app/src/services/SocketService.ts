import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {
    // Private constructor ensures singleton
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl =
      url || import.meta.env.VITE_API_URL || "http://localhost:4041";
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    console.log("Connecting to socket at:", socketUrl);

    this.socket = io(socketUrl, {
      path: "/socket.io",
      autoConnect: true,
      auth: {
        token: token,
      },
    });

    this.socket.on("connect", () => {
      console.log("SocketService connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.error("SocketService connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("SocketService disconnected:", reason);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

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
