import { Queue, JobsOptions } from "bullmq";
import { redisConnection } from "./queue.config.js";
import { JobType, JobPayloads } from "./job.types.js";

/**
 * Description: ตัวส่งคิวแบบ Generic (Pro way)
 * Note      : ตัวเดียวรวบรวมทุก Job ไม่ต้องแยกไฟล์ Queue
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
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
     * Description: ส่งงานเข้าคิว
     * Input     : type - ประเภทของ Job, payload - ข้อมูลสำหรับ Job, options - ตัวเลือกเพิ่มเติม
     * Output    : Promise<Job> - Job ที่ถูกเพิ่มเข้าคิว
     * Note      : รองรับ retry 3 ครั้ง แบบ exponential backoff
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async dispatch<T extends JobType>(
        type: T,
        payload: any,
        options?: JobsOptions
    ) {
        return await this.queue.add(type, payload, options);
    }

    /**
     * Description: ปิดการเชื่อมต่อ Queue
     * Input     : -
     * Output    : Promise<void>
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async close() {
        await this.queue.close();
    }
}

export const jobDispatcher = new JobDispatcher();
