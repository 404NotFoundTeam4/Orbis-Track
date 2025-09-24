import redisUtils from "../../infrastructure/redis.cjs";
const { redisExists, redisSet } = redisUtils;

const PREFIX = "bl:";

export async function blacklistToken(token: string, expSeconds: number) {
    // expSeconds คือเวลาที่ token จะหมดอายุ
    await redisSet(`${PREFIX}${token}`, "1", expSeconds)
}

export async function isTokenBlacklisted(token: string) {
    return await redisExists(`${PREFIX}${token}`);
}
