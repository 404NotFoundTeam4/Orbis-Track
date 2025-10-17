import { z } from "zod";

// Author: Nontapat Sinthum (Guitar) 66160104

export const userRoleSchema = z.object({
  us_role: z.string(),
});

export const getAllUsersRole = z.object({
    roles: z.array(userRoleSchema),
});

export type GetAllUsersRole = z.infer<typeof getAllUsersRole>;