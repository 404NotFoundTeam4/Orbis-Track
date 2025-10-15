import { z } from "zod";

export const userRoleSchema = z.object({
  us_role: z.string(),
});

export const getAllUsersRole = z.object({
    roles: z.array(userRoleSchema),
});

export type GetAllUsersRole = z.infer<typeof getAllUsersRole>;