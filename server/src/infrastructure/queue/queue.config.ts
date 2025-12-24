import { ConnectionOptions } from "bullmq";
import { env } from "../../config/env.js";

/**
 * Description: การตั้งค่าการเชื่อมต่อ Redis สำหรับ BullMQ
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};
