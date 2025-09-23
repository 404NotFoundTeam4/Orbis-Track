import { ValidationError } from '../../errors/errors.js';
import { prisma } from '../../infrastructure/database/client.js';
import { signToken } from '../../utils/jwt.js';
import { verifyPassword } from '../../utils/password.js';
import type { LoginPayload } from './auth.schema.js';

async function checkLogin(payload: LoginPayload) {
    // login logic here
    const { username, passwords } = payload;
    if (!username || !passwords) {
        throw new ValidationError("Missing required fields");
    }

    const result = await prisma.users.findUnique({
        where: { username: username },
        select: {
            user_id: true,
            username: true,
            password: true,
            role_id: true,
            dept_id: true,
            sec_id: true,
            is_active: true,
        },
    });

    if (!result || !result.is_active) {
        throw new ValidationError("Invalid username or password");
    }

    const isPasswordCorrect = await verifyPassword(result.password, passwords)

    if (!isPasswordCorrect) {
        throw new ValidationError("Invalid password");
    }

    const token = signToken({
        sub: result.user_id,
        username: result.username,
        role_id: result.role_id,
        dept_id: result.dept_id,
        sec_id: result.sec_id,
        is_active: result.is_active,
    });

    return token;
}


export const authService = { checkLogin };