import { z } from "zod";
import "dotenv/config";


const DEFAULT_REDIS_URL =
    `redis://default:${encodeURIComponent(process.env.REDIS_PASSWORD ?? "")}` +
    `@${process.env.REDIS_HOST ?? "redis"}:${process.env.REDIS_PORT ?? "6379"}`;

const Env = z.object({
    PORT: z.coerce.number().default(4044),
    API_URL: z.string().url().default("http://localhost:4044").optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // database
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().default(5432),
    DATABASE_URL: z.string().min(1),

    // redis
    REDIS_PASSWORD: z.string().min(1),
    REDIS_URL: z.string()
        .transform(v => {
            const s = (v ?? "").trim();
            return s || DEFAULT_REDIS_URL;
        })
        .refine(v => v.startsWith("redis://"), { message: "Must start with redis://" }),
});

export type EnvType = z.infer<typeof Env>;

export const env: EnvType = Env.parse(process.env);
