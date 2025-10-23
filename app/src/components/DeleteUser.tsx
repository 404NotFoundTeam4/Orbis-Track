import { useState } from "react";
import { Icon } from "@iconify/react";
import UsersService from "../services/UsersService.js"; 
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  user: {
    us_id: number;
    us_emp_code?: string | null;
    us_firstname: string;
    us_lastname: string;
    us_username: string;
    us_email?: string | null;
    us_phone?: string | null;
    us_images?: string | null;
    us_role: string;
    us_dept_name?: string | null;
    us_sec_name?: string | null;
  } | null;
  onClose: () => void;
  onDeleted?: (id?: number) => void;
};

export default function DeleteUser({ open, user, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  // เปิดได้แม้ user ยัง null (จะโชว์ "…" แทน)
  if (!open) return null;

  const handleDelete = async () => {
    if (!user?.us_id) return;
      setLoading(true);
      const resp = await UsersService.softDelete(user.us_id);  // ใช้ Service
      onDeleted?.(resp.us_id);
      onClose();
  };

  //  เรนเดอร์เป็น Portal ไปที่ document.body กันปัญหา overlay/z-index/stack 
  return createPortal(
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40">
      <div className="relative h-[970px] max-h-[95%] w-[804px] max-w-[95%] overflow-hidden rounded-3xl border bg-white p-8 shadow-2xl">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center"
          aria-label="close"
        >
          <svg viewBox="0 0 35 35" className="h-5 w-5" aria-hidden="true">
            <path
              d="M10.6937 24.3024C10.5297 24.1383 10.4375 23.9158 10.4375 23.6838C10.4375 23.4518 10.5297 23.2293 10.6937 23.0652L16.2622 17.4967L10.6937 11.9282C10.5343 11.7632 10.4461 11.5421 10.4481 11.3127C10.4501 11.0833 10.5421 10.8638 10.7043 10.7016C10.8666 10.5394 11.086 10.4473 11.3155 10.4453C11.5449 10.4434 11.7659 10.5315 11.9309 10.6909L17.4994 16.2594L23.0679 10.6909C23.233 10.5315 23.454 10.4434 23.6834 10.4453C23.9128 10.4473 24.1323 10.5394 24.2945 10.7016C24.4568 10.8638 24.5488 11.0833 24.5508 11.3127C24.5528 11.5421 24.4646 11.7632 24.3052 11.9282L18.7367 17.4967L24.3052 23.0652C24.4646 23.2302 24.5528 23.4512 24.5508 23.6807C24.5488 23.9101 24.4568 24.1295 24.2945 24.2918C24.1323 24.454 23.9128 24.546 23.6834 24.548C23.454 24.55 23.233 24.4618 23.0679 24.3024L17.4994 18.7339L11.9309 24.3024C11.7669 24.4665 11.5443 24.5586 11.3123 24.5586C11.0803 24.5586 10.8578 24.4665 10.6937 24.3024Z"
              fill="currentColor"
            />
            <path
              d="M17.5 35C27.1652 35 35 27.1652 35 17.5C35 7.83475 27.1652 0 17.5 0C7.83475 0 0 7.83475 0 17.5C0 27.1652 7.83475 35 17.5 35ZM17.5 33.25C26.1984 33.25 33.25 26.1984 33.25 17.5C33.25 8.80163 26.1984 1.75 17.5 1.75C8.80163 1.75 1.75 8.80163 1.75 17.5C1.75 26.1984 8.80163 33.25 17.5 33.25Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* หัวข้อ */}
        <h2 className="mb-6 text-center font-roboto text-3xl font-bold">ลบบัญชีผู้ใช้</h2>

        {/* รูป */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
            {user?.us_images ? (
              <img src={user.us_images} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <Icon icon="ion:image-outline" className="text-3xl text-gray-300" />
            )}
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
          <div className="col-span-3">
            <h3 className="font-medium text-gray-700">โปรไฟล์</h3>
            <div className="mb-2 text-sm text-gray-400">รายละเอียดโปรไฟล์ผู้ใช้</div>
          </div>

          <Field label="ชื่อ" value={user?.us_firstname ?? "-"} />
          <Field label="นามสกุล" value={user?.us_lastname ?? "-"} />
          <Field label="รหัสพนักงาน" value={user?.us_emp_code ?? "-"} />

          <Field label="อีเมล" value={user?.us_email ?? "-"} />
          <Field label="เบอร์โทรศัพท์" value={user?.us_phone ?? "-"} />
          <div />

          <div className="col-span-3">
            <h3 className="font-medium text-gray-700">ตำแหน่งงาน</h3>
            <div className="mb-2 text-sm text-gray-400">รายละเอียดตำแหน่งงานของผู้ใช้</div>
          </div>

          <Field label="ตำแหน่ง" value={user?.us_role ?? "-"} />
          <Field label="แผนก" value={user?.us_dept_name ?? "-"} />
          <Field label="ฝ่ายย่อย" value={user?.us_sec_name ?? "-"} />

          <div className="col-span-3 mt-4">
            <h3 className="mb-2 font-medium text-gray-700">บัญชี</h3>
            <div className="mb-2 text-sm text-gray-400">รายละเอียดบัญชีของผู้ใช้</div>
          </div>

          <Field label="ชื่อผู้ใช้ (ล็อกอิน)" value={user?.us_username ?? "-"} />

          <div className="col-span-3 mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-500 px-8 py-3 text-white shadow hover:bg-red-600 disabled:opacity-50"
              disabled={loading || !user?.us_id}
            >
              {loading ? "กำลังลบ..." : "ปิดการใช้งาน"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="col-span-1">
      <label className="mb-1 block text-gray-600">{label}</label>
      <div className="flex h-11 w-[221px] items-center rounded-2xl border bg-gray-50 px-4 text-sm text-gray-700">
        {String(value)}
      </div>
    </div>
  );
}