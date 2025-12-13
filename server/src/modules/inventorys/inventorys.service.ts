import { create } from "zustand";
import { env } from "../../config/env.js";
import { UserRole } from "../../core/roles.enum.js";
import { ValidationError } from "../../errors/errors.js";
import { prisma } from "../../infrastructure/database/client.js";
import { CreateDevicePayload } from "./inventorys.schema.js";
import redisUtils from "../../infrastructure/redis.cjs";
import emailService from "../../utils/email/email.service.js";
import { tuple } from "zod";

const { redisSet } = redisUtils;

async function createDevice(payload: CreateDevicePayload, images?: string) {
  const {
    de_serial_number,
    de_name,
    de_description,
    de_location,
    de_max_borrow_days,
    de_images: payloadImages,
    de_af_id,
    de_ca_id,
    de_us_id,
    de_sec_id,
    de_acc_id,
    children,
  } = payload;

  if (
    !de_serial_number ||
    !de_name ||
    !de_location ||
    !de_max_borrow_days ||
    !de_af_id ||
    !de_ca_id ||
    !de_us_id
  ) {
    throw new ValidationError("Missing required fields");
  }

  const finalImages = images ?? payloadImages ?? null;

  const createChildren = Array.isArray(children)
    ? children.map((c: any) => ({
        dec_serial_number: c.dec_serial_number ?? null,
        dec_asset_code: c.dec_asset_code ?? null,
        dec_has_serial_number: typeof c.dec_has_serial_number === "boolean" ? c.dec_has_serial_number : !!c.dec_has_serial_number,
        dec_status: c.dec_status ?? null,
         created_at:new Date(),
        // dec_de_id จะถูกตั้งโดย Prisma เมื่อทำ nested create
        // ไม่ต้องใส่ created_at/updated_at ถ้า DB มี default handling
      }))
    : undefined;

  // ปรับชื่อ model ให้ตรงกับ prisma client ของคุณ: prisma.devices.create หรือ prisma.device.create
  const newDevice = await prisma.devices.create({
    data: {
      de_serial_number,
      de_name,
      de_description: de_description ?? null,
      de_location,
      de_max_borrow_days,
      de_images: finalImages,
      de_af_id,
      de_ca_id,
      de_us_id,
      de_sec_id: de_sec_id ?? null,
      de_acc_id: de_acc_id ?? null,
      // nested create children ถ้ามี
      device_childs: createChildren ? {
        create: createChildren
      } : undefined,
      // created_at/updated_at handled by DB/defaults or set here:
      created_at: new Date(),
    },
    include: {
      device_childs: true, // คืนค่าพร้อม children ที่สร้างขึ้น
    },
  });

  return newDevice;
}

async function getAllDevice() {
  const [devices, devices_child, departments, sections] = await Promise.all([
    prisma.devices.findMany({
      select: {
        de_id: true,
        de_serial_number: true,
        de_name: true,
        de_location: true,
        de_max_borrow_days: true,
        de_images: true,
        de_af_id: true,
        de_ca_id: true,
        de_us_id: true,
        de_sec_id: true,
        de_acc_id: true,
        deleted_at: true,
        created_at: true,
      },
    }),
    // ดึงข้อมูลจากตาราง departments
    prisma.departments.findMany({
      select: {
        dept_id: true,
        dept_name: true,
      },
    }),
    // ดึงข้อมูลจากตาราง sections
    prisma.sections.findMany({
      select: {
        sec_id: true,
        sec_name: true,
        sec_dept_id: true,
      },
    }),
  ]);
  const devices_value = devices.map((device) => {
    departments.find((data) => data.dept_id === device.de_);
  });
}

export const devicesService = {createDevice};
