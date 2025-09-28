/**
 * Description: ตัวช่วยคุยกับ Redis ด้วย ioredis แบบครบเครื่อง
 * Input : ใช้ค่า REDIS_URL จาก env, ใช้ logger กลางของโปรเจกต์
 * Output : ฟังก์ชันสำหรับ Redis + การจัดการ client
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
// src/infrastructure/redis.ts
import Redis, { type Redis as RedisClient, type RedisOptions } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let client: RedisClient | null = null;

function createClient(): RedisClient {
    const c = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        reconnectOnError: (err: any) => {
            const msg = String(err?.message || "");
            const code = String(err?.code || "");
            const should =
                msg.includes("READONLY") ||
                msg.includes("ETIMEDOUT") ||
                code === "ECONNRESET";
            if (should) logger.warn({ err }, "Redis reconnectOnError");
            return should;
        },
    } satisfies RedisOptions);

    c.on("connect", () => logger.info("Redis connected"));
    c.on("ready", () => logger.info("Redis ready"));
    c.on("error", (err: Error) => logger.error({ err }, "Redis error"));
    c.on("reconnecting", () => logger.warn("Redis reconnecting..."));
    c.on("end", () => logger.warn("Redis connection ended"));
    return c;
}

// ดึง client (มีแล้วใช้เลย / ยังไม่มีค่อยสร้าง + connect)
export async function getRedis(): Promise<RedisClient> {
    if (!client) {
        client = createClient();
        await client.connect();
    }
    return client;
}

// ปิดคอนเนกชัน (พยายาม quit ก่อน ไม่ได้ค่อย disconnect)
export async function closeRedis(): Promise<void> {
    if (client) {
        try { await client.quit(); } catch { await client.disconnect(); }
        client = null;
    }
}


/* -------------------------- BASIC KEYS -------------------------- */
export async function redisSet(
    key: string,
    value: string,
    ttlSec?: number
): Promise<"OK" | null> {
    const c = await getRedis();
    return ttlSec ? c.set(key, value, "EX", ttlSec) : c.set(key, value);
}

export async function redisGet(key: string): Promise<string | null> {
    const c = await getRedis();
    return c.get(key);
}

export async function redisDel(key: string | string[]): Promise<number> {
    const c = await getRedis();
    return Array.isArray(key) ? c.del(...key) : c.del(key);
}

export async function redisExists(key: string): Promise<boolean> {
    const c = await getRedis();
    return (await c.exists(key)) === 1;
}

export async function redisExpire(key: string, ttlSec: number): Promise<boolean> {
    const c = await getRedis();
    return (await c.expire(key, ttlSec)) === 1;
}

export async function redisTTL(key: string): Promise<number> {
    const c = await getRedis();
    return c.ttl(key);
}

export async function redisIncrBy(key: string, by = 1): Promise<number> {
    const c = await getRedis();
    return c.incrby(key, by);
}
export async function redisDecrBy(key: string, by = 1): Promise<number> {
    const c = await getRedis();
    return c.decrby(key, by);
}

// ---- JSON HELPERS ----
export async function setJSON<T>(key: string, v: T, ttlSec?: number) {
    return redisSet(key, JSON.stringify(v), ttlSec);
}
export async function getJSON<T = unknown>(key: string): Promise<T | null> {
    const raw = await redisGet(key);
    if (raw == null) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
}

// ---- HASH ----
export async function hsetObject(key: string, obj: Record<string, string | number>) {
    const c = await getRedis();
    const flat: string[] = [];
    for (const [k, v] of Object.entries(obj)) flat.push(k, String(v));
    return c.hset(key, ...flat);
}
export async function hget(key: string, field: string) {
    const c = await getRedis();
    return c.hget(key, field);
}
export async function hgetall(key: string) {
    const c = await getRedis();
    return c.hgetall(key);
}
export async function hdel(key: string, ...fields: string[]) {
    const c = await getRedis();
    return c.hdel(key, ...fields);
}

// ---- SET ----
export async function sadd(key: string, ...members: string[]) {
    const c = await getRedis();
    return c.sadd(key, ...members);
}
export async function srem(key: string, ...members: string[]) {
    const c = await getRedis();
    return c.srem(key, ...members);
}
export async function smembers(key: string) {
    const c = await getRedis();
    return c.smembers(key);
}

// ---- LIST ----
export async function lpush(key: string, ...values: string[]) {
    const c = await getRedis();
    return c.lpush(key, ...values);
}
export async function rpush(key: string, ...values: string[]) {
    const c = await getRedis();
    return c.rpush(key, ...values);
}
export async function lpop(key: string) {
    const c = await getRedis();
    return c.lpop(key);
}
export async function rpop(key: string) {
    const c = await getRedis();
    return c.rpop(key);
}
export async function lrange(key: string, start = 0, stop = -1) {
    const c = await getRedis();
    return c.lrange(key, start, stop);
}

// ---- PUB/SUB (ใช้ connection แยกสำหรับ subscriber) ----
export async function createSubscriber() {
    const base = await getRedis();
    const sub = base.duplicate(); // ioredis มี duplicate()
    await sub.connect();
    return {
        sub,
        subscribe: (channel: string, handler: (msg: string) => void) => {
            sub.on("message", (_ch, msg) => handler(msg));
            return sub.subscribe(channel);
        },
        unsubscribe: (channel: string) => sub.unsubscribe(channel),
        close: () => sub.quit(),
    };
}

export async function publish(channel: string, message: string) {
    const c = await getRedis();
    return c.publish(channel, message);
}

// ---- PIPELINE / TRANSACTION ----
export async function pipelineExec(cmds: Array<[string, ...any[]]>) {
    const c = await getRedis();
    const pipe = c.pipeline();
    cmds.forEach(args => pipe.call(c as any, ...args));
    return pipe.exec(); // [[err, res], ...]
}

export async function multiExec(cmds: Array<[string, ...any[]]>) {
    const c = await getRedis();
    const multi = c.multi();
    cmds.forEach(args => multi.call(c as any, ...args));
    return multi.exec();
}

// ---- SIMPLE DISTRIBUTED LOCK ----
export async function acquireLock(key: string, ttlMs: number) {
    const token = Math.random().toString(36).slice(2);
    const c = await getRedis();
    const ok = await c.set(key, token, "PX", ttlMs, "NX");
    return ok === "OK" ? token : null;
}
export async function releaseLock(key: string, token: string) {
    const c = await getRedis();
    const lua =
        'if redis.call("get", KEYS[1]) == ARGV[1] then ' +
        'return redis.call("del", KEYS[1]) else return 0 end';
    return c.eval(lua, 1, key, token);
}

// ---- HEALTH / TEST ----
export async function ping() {
    const c = await getRedis();
    return c.ping();
}
// ใช้เฉพาะ test!
export async function flushdb() {
    const c = await getRedis();
    return c.flushdb();
}

