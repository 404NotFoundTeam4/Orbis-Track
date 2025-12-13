import { z } from "zod";

export const getInventorySchema = z.object({

});

export type GetInventorySchema = z.infer<typeof getInventorySchema>;