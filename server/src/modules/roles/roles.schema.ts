import { z } from "zod";

// Author: Nontapat Sinthum (Guitar) 66160104

export const userRoleSchema = z.object({
  us_role: z.string().openapi({ description: "บทบาทผู้ใช้งาน" }),
});

export const getAllUsersRole = z.object({
  roles: z.array(userRoleSchema).openapi({ description: "รายการบทบาทผู้ใช้งาน" }),
});

export type GetAllUsersRole = z.infer<typeof getAllUsersRole>;