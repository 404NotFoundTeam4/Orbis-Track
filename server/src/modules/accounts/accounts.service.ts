import { env } from "../../config/env.js";
import { UserRole } from "../../core/roles.enum.js";
import { ValidationError } from "../../errors/errors.js";
import { prisma } from "../../infrastructure/database/client.js";
import { hashPassword } from "../../utils/password.js";
import { OneTimeTokenUtil } from "../../utils/token.js";
import { CreateAccountsPayload, EditAccountSchema, IdParamDto } from "./accounts.schema.js";
import redisUtils from "../../infrastructure/redis.cjs";
import { jobDispatcher } from "../../infrastructure/queue/job.dispatcher.js";
import { JobType } from "../../infrastructure/queue/job.types.js";

const { redisSet } = redisUtils;

/**
 * Description: ค้นหารหัสพนักงานล่าสุด (เช่น E000123) และสร้างรหัสถัดไป (E000124)
 * Input: role - UserRole (ตำแหน่งของพนักงาน)
 * Output: string (รหัสพนักงานใหม่)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function generateNextEmployeeCode(role: UserRole): Promise<string> {
    let PREFIX = "";
    const PADDING = 4;
    const START_NUM = 1;

    if (role === UserRole.ADMIN) {
        PREFIX = "ADM";
    } else if (role === UserRole.HEADDEPT) {
        PREFIX = "HOD";
    } else if (role === UserRole.HEADSEC) {
        PREFIX = "HOS";
    } else if (role === UserRole.TECHNICAL) {
        PREFIX = "TEC";
    } else if (role === UserRole.STAFF) {
        PREFIX = "STA";
    } else if (role === UserRole.USER) {
        PREFIX = "EMP";
    }

    const latestUser = await prisma.users.findFirst({
        where: {
            us_emp_code: {
                startsWith: `${PREFIX}-`,
            },
        },
        orderBy: {
            us_emp_code: 'desc',
        },
        select: {
            us_emp_code: true,
        },
    });

    let nextNum = START_NUM;

    if (latestUser) {
        try {
            const numPart = latestUser.us_emp_code?.replace(`${PREFIX}-`, "").trim();
            const currentNum = Number(numPart || "0");

            if (!Number.isNaN(currentNum)) {
                nextNum = currentNum + 1;
            }
        } catch (e) {
            console.warn("Could not parse latest employee code, starting from 1.", latestUser.us_emp_code, e);
        }
    }

    const nextCode = `${PREFIX}-${String(nextNum).padStart(PADDING, '0')}`;
    return nextCode;
}

/**
 * ดึงข้อมูลผู้ใช้ตาม id
 * Input: params - object { id: number }
 * Output: ข้อมูลผู้ใช้ (select fields)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getAccountById(params: IdParamDto) {
    const { id } = params;
    const user = await prisma.users.findUnique({ where: { us_id: id } });
    if (!user) throw new Error("account not found");
    return prisma.users.findUnique({
        where: { us_id: id },
        select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_username: true,
            us_emp_code: true,
            us_email: true,
            us_phone: true,
            us_images: true,
            us_role: true,
            us_dept_id: true,
            us_sec_id: true,
            us_is_active: true,
            created_at: true,
            updated_at: true,
        },
    });
}

/**
 * Description: ดึงข้อมูลพนักงานพร้อมแผนกและฝ่ายย่อย
 * Input : -
 * Output : ข้อมูลพนักงานพร้อมแนก และฝ่ายย่อย
 * Author: Thakdanai Makmi (Ryu) 66160355
*/
async function getAllAccounts() {
    const [departments, sections, users] = await Promise.all([
        // ดึงข้อมูลจากตาราง departments
        prisma.departments.findMany({
            select: {
                dept_id: true,
                dept_name: true
            }
        }),
        // ดึงข้อมูลจากตาราง sections
        prisma.sections.findMany({
            select: {
                sec_id: true,
                sec_name: true,
                sec_dept_id: true
            }
        }),
        // ดึงข้อมูลจากตาราง users
        prisma.users.findMany({
            select: {
                us_id: true,
                us_emp_code: true,
                us_firstname: true,
                us_lastname: true,
                us_username: true,
                us_email: true,
                us_phone: true,
                us_images: true,
                us_role: true,
                us_dept_id: true,
                us_sec_id: true,
                us_is_active: true,
                created_at: true,
            }
        })
    ]);

    // แปลงแผนกและฝ่ายย่อยเป็นข้อความ
    const accountsWithDetails = users.map((user) => {
        // หา dept_id ที่ตรงกับ us_dept_id
        const deptpartment = departments.find((data) => data.dept_id === user.us_dept_id);
        // หา sec_id ที่ตรงกับ us_sec_id
        const section = sections.find((data) => data.sec_id === user.us_sec_id);

        // คืนค่าพร้อมขื่อแผนกและฝ่ายย่อย
        return {
            ...user,
            us_dept_name: deptpartment?.dept_name,
            us_sec_name: section?.sec_name
        }
    })

    return ({
        departments,
        sections,
        accountsWithDetails
    })
}

/**
 * Description: เพิ่มบัญชีผู้ใช้งาน
 * Input : รหัสพนักงาน, ชื่อ, นามสุล, ชื่อผู้ใช้งาน, รหัสผ่าน, อีเมล, เบอร์โทรศัพท์, รูปภาพ, ตำแหน่ง, แผนก, ฝ่ายย่อย
 * Output : บัญชีผู้ใช้งานคนใหม่
 * Author: Thakdanai Makmi (Ryu) 66160355
*/
async function createAccounts(payload: CreateAccountsPayload, images: any) {
    const {
        us_firstname,
        us_lastname,
        us_username,
        us_password,
        us_email,
        us_phone,
        us_role,
        us_dept_id,
        us_sec_id } = payload

    // ถ้าไม่มี firstname หรือ lastname หรือ username หรือ password หรือ role ให้โยน error
    if (!us_firstname || !us_lastname || !us_username || !us_password || !us_role) {
        throw new ValidationError("Missing required fields");
    }

    // Hash Password
    const hashedPassword = await hashPassword(us_password);

    const newEmployeeCode = await generateNextEmployeeCode(us_role as UserRole);

    // เพิ่มข้อมูลผู้ใช้ใหม่ลงในตาราง users
    const newUser = await prisma.users.create({
        data: {
            us_emp_code: newEmployeeCode,
            us_firstname,
            us_lastname,
            us_username,
            us_password: hashedPassword,
            us_email,
            us_phone,
            us_role: us_role as UserRole,
            us_images: images,
            us_dept_id,
            us_sec_id,
        },
        select: {
            us_id: true,
            us_emp_code: true,
            us_firstname: true,
            us_lastname: true,
            us_username: true,
            us_email: true,
            us_phone: true,
            us_role: true,
            us_images: true,
            us_dept_id: true,
            us_sec_id: true,
            created_at: true,
            updated_at: true,
        }
    });

    // Author: Pakkapon Chomchoey (Tonnam) 66160080
    // สร้าง one-time token สำหรับให้ผู้ใช้ใหม่ตั้งรหัสผ่านครั้งแรก
    const { plainTextToken } = await OneTimeTokenUtil.generateToken();

    // สร้าง Redis key และเก็บ token พร้อม user id โดยกำหนดเวลาหมดอายุ
    const redisKey = `welcome-token:${plainTextToken}`;
    const expiryInSeconds = Number(env.EXPIRE_TOKEN); // 24 ชั่วโมง
    await redisSet(redisKey, newUser.us_id.toString(), expiryInSeconds);

    // สร้าง URL สำหรับหน้า reset password พร้อม token
    const welcomeUrl = `${env.FRONTEND_URL}/reset-password?token=${plainTextToken}`;

    // ส่งอีเมล welcome ผ่าน Job Dispatcher (Pro way)
    await jobDispatcher.dispatch(JobType.EMAIL_WELCOME, {
        email: newUser.us_email,
        name: newUser.us_firstname,
        username: newUser.us_username,
        resetPasswordUrl: welcomeUrl,
        expiryHours: String(expiryInSeconds),
    });

    return newUser;
}

/**
 * Description: อัปเดตข้อมูลผู้ใช้ตาม id
 * Input :
 * - id: number
 * - data: Partial<{ us_firstname, us_lastname, us_username, us_emp_code, us_email, us_phone, us_images, us_role, us_dept_id, us_sec_id }>
 * Output : updated user object
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function updateAccount(params: IdParamDto, body: EditAccountSchema, images: any) {
    const { id } = params;
    const user = await prisma.users.findUnique({ where: { us_id: id } });
    if (!user) throw new Error("account not found");
    const updateData: any = {
        us_images: images,
        ...body,
    }

    await prisma.users.update({
        where: { us_id: id },
        data: updateData,
    });
    return { message: "User updated successfully" };
}
/**
 * Description: ปิดการใช้งานบัญชีผู้ใช้
 * Input: user_id
 * Output: date (วัน-เวลาที่ถูกปิด) เปลี่ยนสถานะ is_active เป็น false
 * Author: Chanwit Muangma (Boom) 66160224
 */
export async function softDeleteAccount(us_id: number) {
    //เช็คตัว UserId ว่าเจอไหม
    const user = await prisma.users.findUnique({ where: { us_id } });
    if (!user) throw new Error("User not found");

    //update ตัว Field
    const updated = await prisma.users.update({
        where: { us_id },
        data: {
            deleted_at: new Date(),
            us_is_active: false,
        },
        select: { us_id: true, deleted_at: true },
    });

    return {
        userID: updated.us_id,
        deleteAt: updated.deleted_at
    }
}

export const accountsService = { getAccountById, getAllAccounts, createAccounts, updateAccount, softDeleteAccount, generateNextEmployeeCode };
