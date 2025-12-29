import { Worker, Job } from "bullmq";
import { redisConnection } from "./queue.config.js";
import { JobType } from "./job.types.js";
import emailService from "../../utils/email/email.service.js";

/**
 * Description: ตัวจัดการการประมวลผล Job แบบรวมศูนย์
 * Note      : สามารถเพิ่ม Handler ใหม่ๆ ได้ที่นี่ที่เดียว
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */

// รวม Handlers ไว้ในที่เดียว
const handlers: Record<string, (data: any) => Promise<void>> = {
    [JobType.EMAIL_WELCOME]: async (data) => {
        await emailService.sendWelcome(data.email, data);
    },

    // เพิ่ม Job ใหม่ๆ ได้ที่นี่...
    // [JobType.NOTIFICATION_GENERIC]: async (data) => { ... },
};

export const mainWorker = new Worker(
    "main-app-queue",
    async (job: Job) => {
        console.log(`[Worker] Started processing: ${job.name} (id: ${job.id})`);

        const handler = handlers[job.name];
        if (handler) {
            await handler(job.data);
        } else {
            console.warn(`[Worker] No handler found for job type: ${job.name}`);
        }
    },
    {
        connection: redisConnection,
        concurrency: 5, // จัดการงานพร้อมกันได้ 5 งาน
    }
);

mainWorker.on("completed", (job) => {
    console.log(`[Worker] Finished: ${job.name} (id: ${job.id})`);
});

mainWorker.on("failed", (job, err) => {
    console.error(`[Worker] Failed: ${job?.name} (id: ${job?.id}) -> ${err.message}`);
});
