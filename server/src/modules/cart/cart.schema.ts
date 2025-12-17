import { z } from "zod";

// Author: Rachata Jitjeankhan (Tang) 66160369

/* ---------- Params ---------- */
/**
 * Description: Schema สำหรับตรวจสอบพารามิเตอร์ id ของอุปกรณ์ในรถเข็น
 * Input     : { id: number } - id ของอุปกรณ์ในรถเข็น
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้าง { id: number }
 * Logic     :
 *   - แปลงค่าพารามิเตอร์เป็น number
 *   - ตรวจสอบว่าเป็นจำนวนเต็มและมากกว่า 0
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const getCartDeviceDetailParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateCartDeviceDetailParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* ---------- Relations ---------- */
/**
 * Description: Schema สำหรับข้อมูลรถเข็น (cart)
 * Input     : -
 * Output    : Object ที่ประกอบด้วย ct_id, ct_status, created_at, updated_at
 * Logic     :
 *   - ใช้สำหรับ include ข้อมูล cart ใน response ของ cart item
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const cartSchema = z.object({
  ct_id: z.number(),
  ct_status: z.string().nullable(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
});

/**
 * Description: Schema สำหรับอุปกรณ์ย่อย (device child)
 * Input     : -
 * Output    : Object ของ device child ประกอบด้วย dec_id, dec_name, dec_serial
 * Logic     :
 *   - ใช้สำหรับ include ข้อมูล device_child ใน response ของ cart item
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const deviceChildSchema = z.object({
  dec_id: z.number(),
  dec_name: z.string(),
  dec_serial: z.string().nullable(),
});

/* ---------- GET Response ---------- */
/**
 * Description: Schema สำหรับแสดงรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : ctiId (number)
 * Output    : Object ของ cart item รวมข้อมูลผู้ยืม, จำนวน, วันที่, และความสัมพันธ์กับ cart และ device_child
 * Logic     :
 *   - Validate ข้อมูลที่ได้จาก database
 *   - ใช้สำหรับ response ของ API GET /borrow/cart/device/:id
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const cartDeviceDetailSchema = z.object({
  cti_id: z.number(),
  cti_us_name: z.string().nullable(),
  cti_phone: z.string().nullable(),
  cti_note: z.string().nullable(),
  cti_usage_location: z.string().nullable(),
  cti_quantity: z.number(),
  cti_start_date: z.coerce.date().nullable(),
  cti_end_date: z.coerce.date().nullable(),
  cti_ct_id: z.number(),
  cti_dec_id: z.number(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
  carts: cartSchema,
  device_childs: z.array(deviceChildSchema).optional(),
});

/* ---------- PATCH Body ---------- */
/**
 * Description: Schema สำหรับแก้ไขรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : Payload สำหรับอัปเดตค่าต่าง ๆ ของอุปกรณ์ เช่น ชื่อผู้ใช้, เบอร์โทร, จำนวน, โน้ต, สถานที่ใช้งาน, วันที่เริ่ม-สิ้นสุด
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้างของ payload
 * Logic     :
 *   - ตรวจสอบแต่ละฟิลด์ว่าเป็น optional และสามารถเป็น null ได้
 *   - ใช้ validate ก่อนส่งไป update database
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const updateCartDeviceDetailBodySchema = z.object({
  cti_us_name: z.string().nullable().optional(),
  cti_phone: z.string().nullable().optional().default(null),
  cti_quantity: z.number().int().positive().optional(),
  cti_note: z.string().nullable().optional(),
  cti_usage_location: z.string().nullable().optional(),
  cti_start_date: z.coerce.date().nullable().optional(),
  cti_end_date: z.coerce.date().nullable().optional(),
});

/* ---------- PATCH Response ---------- */
/**
 * Description: Schema สำหรับ response หลังแก้ไขรายละเอียดอุปกรณ์
 * Input     : ctiId (number), payload (UpdateCartDeviceDetailBodySchema)
 * Output    : Object ของ cart item พร้อมข้อมูล device_child ที่อัปเดต
 * Logic     :
 *   - Validate ข้อมูล response ก่อนส่งกลับ client
 *   - รวมข้อมูล relation ของ cart และ device_child
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const updateCartDeviceDetailResponseSchema = z.object({
  ...cartDeviceDetailSchema.shape,
  device_child: z.object({
    dec_id: z.number(),
    dec_serial_number: z.string().nullable(),
    dec_asset_code: z.string().nullable(),
    dec_has_serial_number: z.boolean(),
    dec_status: z.string(),
    dec_de_id: z.number(),
    deleted_at: z.date().nullable(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
  }),
});

export type UpdateCartDeviceDetailBodySchema = z.infer<typeof updateCartDeviceDetailBodySchema>;