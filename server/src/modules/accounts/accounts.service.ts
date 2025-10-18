import { UserRole } from "../../core/roles.enum.js";
import { ValidationError } from "../../errors/errors.js";
import { prisma } from "../../infrastructure/database/client.js";
import { hashPassword } from "../../utils/password.js";
import { CreateAccountsPayload, EditAccountSchema, IdParamDto } from "./accounts.schema.js";

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
        us_emp_code,
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

    const us_images = images;

    // Hash Password
    const hashedPassword = await hashPassword(us_password);

    // เพิ่มข้อมูลผู้ใช้ใหม่ลงในตาราง users
    return await prisma.users.create({
        data: {
            us_emp_code,
            us_firstname,
            us_lastname,
            us_username,
            us_password: hashedPassword,
            us_email,
            us_phone,
            us_role: us_role as UserRole,
            us_images,
            us_dept_id,
            us_sec_id,
            created_at: new Date(),
            updated_at: new Date(),
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
}

/**
 * Description: อัปเดตข้อมูลผู้ใช้ตาม id
 * Input :
 * - id: number
 * - data: Partial<{ us_firstname, us_lastname, us_username, us_emp_code, us_email, us_phone, us_images, us_role, us_dept_id, us_sec_id }>
 * Output : updated user object
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
 async function updateAccount(params: IdParamDto, body: EditAccountSchema) {
     const { id } = params;
     const user = await prisma.users.findUnique({ where: { us_id: id } });
     if (!user) throw new Error("account not found");
     const updateData: any = {
       ...body,
       updated_at: new Date(),
     }

     await prisma.users.update({
         where: { us_id: id },
         data: updateData,
     });
     return { message: "User updated successfully" };
 }

export const accountsService = { getAccountById, getAllAccounts, createAccounts, updateAccount };
