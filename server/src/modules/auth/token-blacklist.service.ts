import redisUtils from "../../infrastructure/redis.cjs";
const { redisExists, redisSet } = redisUtils;

const PREFIX = "bl:";

/**
 * Description: นำ JWT token ขึ้นบัญชีดำ (Blacklist) ใน Redis ตามเวลาเหลือของโทเคน
 * Input : token: string, expSeconds: number
 * Output : void
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export async function blacklistToken(token: string, expSeconds: number) {
    // expSeconds คือเวลาที่ token จะหมดอายุ
    await redisSet(`${PREFIX}${token}`, "1", expSeconds)
}


/**
 * Description: ตรวจว่าโทเคนถูกขึ้นบัญชีดำอยู่หรือไม่
 * Input : token: string
 * Output : boolean //true = อยู่ใน blacklist
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export async function isTokenBlacklisted(token: string) {
    return await redisExists(`${PREFIX}${token}`);
}
