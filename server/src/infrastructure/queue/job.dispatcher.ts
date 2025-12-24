import { Queue, JobsOptions } from "bullmq";
import { redisConnection } from "./queue.config.js";
import { JobType, JobPayloads } from "./job.types.js";

/**
 * Description: ตัวส่งคิวแบบ Generic (Pro way)
 * - ตัวเดียวรวบรวมทุก Job ไม่ต้องแยกไฟล์ Queue
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
class JobDispatcher {
    private queue: Queue;

    constructor() {
        this.queue = new Queue("main-app-queue", {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: true, // ประหยัด Redis memory
            },
        });
    }

    /**
     * ส่งงานเข้าคิว
     */
    async dispatch<T extends JobType>(
        type: T,
        payload: any,
        options?: JobsOptions
    ) {
        return await this.queue.add(type, payload, options);
    }

    /**
     * สำหรับปิดระบบ
     */
    async close() {
        await this.queue.close();
    }
}

export const jobDispatcher = new JobDispatcher();
