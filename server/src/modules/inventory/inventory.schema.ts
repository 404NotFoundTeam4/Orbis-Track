import { z } from "zod";

// Author: Sutaphat Thahin (Yeen) 66160378
export const inventorySchema = z.object({
    de_id: z.number(),
    de_serial_number: z.string(),
    de_name: z.string(),
    de_description: z.string().nullable(),
    de_location: z.string(),
    de_max_borrow_days: z.number(),
    de_images: z.string().nullable(),
    category:z.string(),
    department: z.string().nullable().optional(),
    sub_section: z.string().nullable().optional(),
    total: z.number(),
    available: z.number(),
});

export const getInventorySchema = z.array(inventorySchema);

export type GetInventorySchema = z.infer<typeof getInventorySchema>;