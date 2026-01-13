import React, { useMemo, useState } from "react";
import Dropdown from "../components/DropDown";
import Button from "../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { AlertDialog } from "../components/AlertDialog";
import { Icon } from "@iconify/react";
import { useToast } from "../components/Toast";
import {
  NotificationList,
  NotificationBell,
  type NotificationItemProps,
} from "../components/Notification";
import { socketService } from "../services/SocketService";

const mockNotifications: NotificationItemProps[] = [
  {
    type: "approved",
    title: "คำขอยืมถูกอนุมัติแล้ว",
    description: (
      <>
        สถานที่รับอุปกรณ์ : <span className="text-blue-500">XXXXXXX</span>
        <br />
        โปรดรับอุปกรณ์ภายในเวลาที่กำหนด
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "warning",
    title: "มีอุปกรณ์ใกล้กำหนดคืน",
    description: "กรุณาคืนรายการโปรเจคเตอร์ ภายในเวลา 17:00 น.",
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "overdue",
    title: "มีอุปกรณ์ที่เลยกำหนดคืนแล้ว",
    description: (
      <span className="text-red-500">คำขอยืมโปรเจคเตอร์ เลยกำหนดคืนแล้ว</span>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "repair_success",
    title: "ผลคำขอซ่อมอุปกรณ์",
    description: (
      <>
        PJU-001 : <span className="text-green-500">ซ่อมสำเร็จ</span>
        <br />
        PJU-002 : <span className="text-red-500">ซ่อมไม่สำเร็จ</span>
        <br />
        โปรดติดต่อช่างเทคนิคเพื่อรับอุปกรณ์คืน
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "repair_new",
    title: "แจ้งเตือนคำร้องซ่อมใหม่",
    description: "มีคำร้องซ่อมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_new",
    title: "แจ้งเตือนคำขอยืมใหม่",
    description: "มีคำขอยืมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_pending",
    title: "มีคำขอยืมที่กำลังรออนุมัติ",
    description: (
      <>
        ลำดับการอนุมัติปัจจุบัน :{" "}
        <span className="text-green-600 font-bold">2</span> / 4
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "rejected",
    title: "คำขอยืมถูกปฏิเสธ",
    description: "เหตุผลการปฏิเสธ : ไม่ให้ยืมงก",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "approved",
    title: "คำขอยืมถูกอนุมัติแล้ว",
    description: (
      <>
        สถานที่รับอุปกรณ์ : <span className="text-blue-500">XXXXXXX</span>
        <br />
        โปรดรับอุปกรณ์ภายในเวลาที่กำหนด
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "warning",
    title: "มีอุปกรณ์ใกล้กำหนดคืน",
    description: "กรุณาคืนรายการโปรเจคเตอร์ ภายในเวลา 17:00 น.",
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "overdue",
    title: "มีอุปกรณ์ที่เลยกำหนดคืนแล้ว",
    description: (
      <span className="text-red-500">คำขอยืมโปรเจคเตอร์ เลยกำหนดคืนแล้ว</span>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "repair_success",
    title: "ผลคำขอซ่อมอุปกรณ์",
    description: (
      <>
        PJU-001 : <span className="text-green-500">ซ่อมสำเร็จ</span>
        <br />
        PJU-002 : <span className="text-red-500">ซ่อมไม่สำเร็จ</span>
        <br />
        โปรดติดต่อช่างเทคนิคเพื่อรับอุปกรณ์คืน
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "repair_new",
    title: "แจ้งเตือนคำร้องซ่อมใหม่",
    description: "มีคำร้องซ่อมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_new",
    title: "แจ้งเตือนคำขอยืมใหม่",
    description: "มีคำขอยืมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_pending",
    title: "มีคำขอยืมที่กำลังรออนุมัติ",
    description: (
      <>
        ลำดับการอนุมัติปัจจุบัน :{" "}
        <span className="text-green-600 font-bold">2</span> / 4
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "rejected",
    title: "คำขอยืมถูกปฏิเสธ",
    description: "เหตุผลการปฏิเสธ : ไม่ให้ยืมงก",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "approved",
    title: "คำขอยืมถูกอนุมัติแล้ว",
    description: (
      <>
        สถานที่รับอุปกรณ์ : <span className="text-blue-500">XXXXXXX</span>
        <br />
        โปรดรับอุปกรณ์ภายในเวลาที่กำหนด
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "warning",
    title: "มีอุปกรณ์ใกล้กำหนดคืน",
    description: "กรุณาคืนรายการโปรเจคเตอร์ ภายในเวลา 17:00 น.",
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "overdue",
    title: "มีอุปกรณ์ที่เลยกำหนดคืนแล้ว",
    description: (
      <span className="text-red-500">คำขอยืมโปรเจคเตอร์ เลยกำหนดคืนแล้ว</span>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "repair_success",
    title: "ผลคำขอซ่อมอุปกรณ์",
    description: (
      <>
        PJU-001 : <span className="text-green-500">ซ่อมสำเร็จ</span>
        <br />
        PJU-002 : <span className="text-red-500">ซ่อมไม่สำเร็จ</span>
        <br />
        โปรดติดต่อช่างเทคนิคเพื่อรับอุปกรณ์คืน
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "repair_new",
    title: "แจ้งเตือนคำร้องซ่อมใหม่",
    description: "มีคำร้องซ่อมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_new",
    title: "แจ้งเตือนคำขอยืมใหม่",
    description: "มีคำขอยืมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_pending",
    title: "มีคำขอยืมที่กำลังรออนุมัติ",
    description: (
      <>
        ลำดับการอนุมัติปัจจุบัน :{" "}
        <span className="text-green-600 font-bold">2</span> / 4
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "rejected",
    title: "คำขอยืมถูกปฏิเสธ",
    description: "เหตุผลการปฏิเสธ : ไม่ให้ยืมงก",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "approved",
    title: "คำขอยืมถูกอนุมัติแล้ว",
    description: (
      <>
        สถานที่รับอุปกรณ์ : <span className="text-blue-500">XXXXXXX</span>
        <br />
        โปรดรับอุปกรณ์ภายในเวลาที่กำหนด
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "warning",
    title: "มีอุปกรณ์ใกล้กำหนดคืน",
    description: "กรุณาคืนรายการโปรเจคเตอร์ ภายในเวลา 17:00 น.",
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "overdue",
    title: "มีอุปกรณ์ที่เลยกำหนดคืนแล้ว",
    description: (
      <span className="text-red-500">คำขอยืมโปรเจคเตอร์ เลยกำหนดคืนแล้ว</span>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: false,
  },
  {
    type: "repair_success",
    title: "ผลคำขอซ่อมอุปกรณ์",
    description: (
      <>
        PJU-001 : <span className="text-green-500">ซ่อมสำเร็จ</span>
        <br />
        PJU-002 : <span className="text-red-500">ซ่อมไม่สำเร็จ</span>
        <br />
        โปรดติดต่อช่างเทคนิคเพื่อรับอุปกรณ์คืน
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "repair_new",
    title: "แจ้งเตือนคำร้องซ่อมใหม่",
    description: "มีคำร้องซ่อมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_new",
    title: "แจ้งเตือนคำขอยืมใหม่",
    description: "มีคำขอยืมกำลังรออนุมัติ",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "request_pending",
    title: "มีคำขอยืมที่กำลังรออนุมัติ",
    description: (
      <>
        ลำดับการอนุมัติปัจจุบัน :{" "}
        <span className="text-green-600 font-bold">2</span> / 4
      </>
    ),
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
  {
    type: "rejected",
    title: "คำขอยืมถูกปฏิเสธ",
    description: "เหตุผลการปฏิเสธ : ไม่ให้ยืมงก",
    timestamp: "12 ม.ค. 2568",
    isRead: true,
  },
];

const NotificationExample = () => {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center gap-10">
      <h1 className="text-3xl font-bold">Notification Component Example</h1>

      <div className="relative">
        <NotificationBell count={3} onClick={() => setShowNotif(!showNotif)} />

        {showNotif && (
          <div className="absolute top-12 left-0 z-50">
            <NotificationList
              notifications={mockNotifications}
              onClose={() => setShowNotif(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { NotificationExample };

/**
 * Component: SimpleExample
 * Description: ตัวอย่างการใช้งาน Dropdown แบบง่ายที่สุด
 */
function SimpleExample() {
  type FruitItem = { id: number; label: string; value: string };
  const [selectedFruit, setSelectedFruit] = useState<FruitItem | null>(null);

  const fruits: FruitItem[] = [
    { id: 1, label: "แอปเปิ้ล", value: "apple" },
    { id: 2, label: "กล้วย", value: "banana" },
    { id: 3, label: "ส้ม", value: "orange" },
    { id: 4, label: "มะม่วง", value: "mango" },
  ];

  return (
    <div className="p-6 border rounded-xl bg-white">
      <h3 className="text-lg font-semibold mb-3">ตัวอย่างพื้นฐาน</h3>
      <Dropdown
        items={fruits}
        value={selectedFruit}
        onChange={setSelectedFruit}
        placeholder="เลือกผลไม้"
        label="ผลไม้ที่ชอบ"
      />

      {selectedFruit && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700">
            คุณเลือก: <strong>{selectedFruit.label}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Value: {selectedFruit.value}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Component: TableFilterExample
 * Description: ตัวอย่างการกรองข้อมูลในตารางด้วย Dropdown
 */
function TableFilterExample() {
  type RoleItem = { id: string | number; label: string; value: string };
  const roles: RoleItem[] = [
    { id: "all", label: "ทั้งหมด", value: "all" },
    { id: "admin", label: "ผู้ดูแลระบบ", value: "admin" },
    { id: "manager", label: "ผู้จัดการ", value: "manager" },
    { id: "staff", label: "พนักงาน", value: "staff" },
  ];

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(roles[0]);

  const users = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "manager" },
    { id: 3, name: "Charlie", email: "charlie@example.com", role: "staff" },
    { id: 4, name: "Daisy", email: "daisy@example.com", role: "staff" },
    { id: 5, name: "Evan", email: "evan@example.com", role: "manager" },
  ];

  const filteredUsers = useMemo(() => {
    if (!selectedRole || selectedRole.value === "all") return users;
    return users.filter((u) => u.role === selectedRole.value);
  }, [selectedRole]);

  return (
    <div className="p-6 border rounded-xl bg-white">
      <h3 className="text-lg font-semibold mb-3">กรองตารางด้วย Dropdown</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
        <Dropdown
          items={roles}
          value={selectedRole}
          onChange={setSelectedRole}
          placeholder="เลือกบทบาท"
          label="บทบาทผู้ใช้"
        />
        <div className="text-sm text-gray-600 md:col-span-2">
          แสดงผล: {filteredUsers.length} รายการ
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อ
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อีเมล
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                บทบาท
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{u.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                <td className="px-4 py-2 text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Component: ButtonExamples
 * Description: ตัวอย่างการใช้งานปุ่มหลายรูปแบบและขนาด
 */
function ButtonExamples() {
  return (
    <div className="p-6 border rounded-xl bg-white space-y-4">
      <h3 className="text-lg font-semibold">ตัวอย่าง Button</h3>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="dangerIcon">Danger Icon</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">ขนาดเล็ก (sm)</Button>
          <Button size="md">ขนาดกลาง (md)</Button>
          <Button size="lg">ขนาดใหญ่ (lg)</Button>
        </div>
        <div className="w-64">
          <Button fullWidth>
            {<FontAwesomeIcon icon={faChevronDown} />}
            เต็มความกว้าง
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlertDemoPage() {
  const [open, setOpen] = React.useState<
    | null
    | "add-dept"
    | "edit-sub"
    | "add-user"
    | "delete-dept"
    | "deactivate"
    | "return-device"
  >(null);

  // ค่ามาตรฐานตามภาพ (แก้ตรงนี้ครั้งเดียวทุก dialog จะตาม)
  const spec = {
    width: 610,
    radius: 16,
    padX: 83,
    padY: 43,
    ringThickness: 4,
    iconSize: 104,
    buttonsGap: 36,
    buttonW: 112,
    buttonH: 46,
    titleTextPx: 32,
    descTextPx: 18,
    buttonTextPx: 18,
  } as const;

  const Box = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-xs text-violet-200">{title}</div>
      <div className="rounded-2xl bg-white p-6 text-center shadow">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-neutral-900 p-6 text-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Box title="ยืนยันการเพิ่มแผนก? / success">
          <Button
            icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}
            onClick={() => setOpen("add-dept")}
          >
            Open
          </Button>
        </Box>

        <Box title="ยืนยันการแก้ไขฝ่ายย่อย? / warning (ปุ่มยังเขียว)">
          <Button
            icon={<Icon icon="mdi:pencil" width="22" height="22" />}
            onClick={() => setOpen("edit-sub")}
          >
            Open
          </Button>
        </Box>

        <Box title="ยืนยันการเพิ่มบัญชีผู้ใช้ใหม่? / success">
          <Button
            icon={
              <Icon icon="mdi:account-plus-outline" width="22" height="22" />
            }
            onClick={() => setOpen("add-user")}
          >
            Open
          </Button>
        </Box>

        <Box title="ลบแผนกซ่อมบำรุง / danger">
          <Button
            variant="danger"
            icon={<Icon icon="mdi:trash-can-outline" width="22" height="22" />}
            onClick={() => setOpen("delete-dept")}
          >
            Open
          </Button>
        </Box>

        <Box title="ปิดการใช้งานบัญชีนี้ / danger">
          <Button
            variant="danger"
            icon={<Icon icon="mdi:power" width="22" height="22" />}
            onClick={() => setOpen("deactivate")}
          >
            Open
          </Button>
        </Box>

        <Box title="ยืนยันการรับคืนอุปกรณ์? / success">
          <Button
            icon={
              <Icon icon="mdi:clipboard-check-outline" width="22" height="22" />
            }
            onClick={() => setOpen("return-device")}
          >
            Open
          </Button>
        </Box>
      </div>

      {/* Dialogs */}
      <AlertDialog
        open={open === "add-dept"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="success"
        title="ยืนยันการเพิ่มแผนก?"
        description="ข้อมูลจะถูกเพิ่มลงในรายการภายในคลังของคุณ"
        icon={<Icon icon="mdi:clipboard-plus-outline" className="h-16 w-16" />}
        {...spec}
        onConfirm={() => console.log("confirm add dept")}
      />

      <AlertDialog
        open={open === "edit-sub"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="warning"
        title="ยืนยันการแก้ไขฝ่ายย่อย?"
        description="การแก้ไขรายการนี้สามารถถูกบันทึกได้"
        icon={<Icon icon="mdi:pencil-circle-outline" className="h-16 w-16" />}
        {...spec}
        onConfirm={() => console.log("confirm edit sub")}
      />

      <AlertDialog
        open={open === "add-user"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="success"
        title="ยืนยันการเพิ่มบัญชีผู้ใช้ใหม่?"
        icon={<Icon icon="mdi:account-plus-outline" className="h-16 w-16" />}
        {...spec}
        onConfirm={() => console.log("confirm add user")}
      />

      <AlertDialog
        open={open === "delete-dept"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="danger"
        title="คุณแน่ใจหรือไม่ว่าต้องการลบแผนกซ่อมบำรุง?"
        description="คำสั่งนี้ไม่สามารถกู้คืนได้"
        icon={<Icon icon="mdi:alert-outline" className="h-16 w-16" />}
        {...spec}
        onConfirm={() => console.log("confirm delete dept")}
      />

      <AlertDialog
        open={open === "deactivate"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="danger"
        title="คุณแน่ใจหรือไม่ว่าต้องการปิดการใช้งานบัญชีนี้?"
        description="การดำเนินการนี้ไม่สามารถยกเลิกได้"
        icon={<Icon icon="mdi:account-off-outline" className="h-16 w-16" />}
        {...spec}
        onConfirm={() => console.log("confirm deactivate")}
      />

      <AlertDialog
        open={open === "return-device"}
        onOpenChange={(o) => !o && setOpen(null)}
        tone="success"
        title="ยืนยันการรับคืนอุปกรณ์?"
        description="การดำเนินการนี้สามารถยกเลิกได้"
        icon={
          <Icon icon="mdi:package-variant-closed-check" className="h-16 w-16" />
        }
        {...spec}
        onConfirm={() => console.log("confirm return device")}
      />
    </div>
  );
}

function DemoButtons() {
  const { push } = useToast();

  return (
    <div className="space-x-2">
      <button
        className="rounded-full bg-rose-500 px-4 py-2 text-white"
        onClick={() =>
          push({ tone: "confirm", message: "เพิ่มอุปกรณ์ใหม่ในคลังแล้ว!" })
        }
      >
        ลบสำเร็จ (แดง)
      </button>

      <button
        className="rounded-full bg-emerald-500 px-4 py-2 text-white"
        onClick={() => push({ tone: "danger", message: "ลบอุปกรณ์เสร็จสิ้น!" })}
      >
        บันทึกสำเร็จ (เขียว)
      </button>

      <button
        className="rounded-full bg-blue-500 px-4 py-2 text-white"
        onClick={() =>
          push({
            tone: "notification",
            message: "มีการแจ้งเตือนใหม่!",
            description: "แตะเพื่อดูรายละเอียดในกล่องแจ้งเตือน",
          })
        }
      >
        Notification Toast (สีน้ำเงิน)
      </button>
    </div>
  );
}

function SocketDemo() {
  const sendTest = (type: string, hasRoute: boolean) => {
    socketService.emit("TEST_NOTIFICATION", {
      id: Date.now(),
      type: type, // "approved", "warning", "rejected", etc.
      title: `ทดสอบ ${type.toUpperCase()}`,
      message: hasRoute
        ? "คลิกเพื่อไปที่หน้ารายการ (มี Target Route)"
        : "คลิกเพื่อเปิดกล่องกระดิ่ง (ไม่มี Target Route)",
      target_route: hasRoute ? "/requests" : null,
    });
  };

  return (
    <div className="p-6 border rounded-xl bg-white space-y-4">
      <h3 className="text-lg font-semibold">Real-Time Socket & Notification Click Demo</h3>
      <p className="text-sm text-gray-500">
        กดปุ่มด้านล่างเพื่อจำลองว่ามี Event ส่งมาจาก Server (ผ่าน Socket.io) <br />
        ลองคลิกที่ Toast หรือ รายการในกระดิ่งเพื่อทดสอบ Navigation Logic
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-700">Case 1: มี Target Route (ไปหน้างาน)</h4>
          <Button onClick={() => sendTest('approved', true)} size="sm">
            อนุมัติ (Approved)
          </Button>
          <Button onClick={() => sendTest('repair_success', true)} size="sm">
            ซ่อมเสร็จ (Repair Success)
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-700">Case 2: ไม่มี Route (เปิดกระดิ่ง)</h4>
          <Button onClick={() => sendTest('general', false)} variant="outline" size="sm">
            แจ้งเตือน (Warning)
          </Button>
          <Button onClick={() => sendTest('rejected', false)} variant="danger" size="sm">
            ปฏิเสธ (Rejected)
          </Button>
          <Button onClick={() => {
            socketService.emit("TEST_NOTIFICATION", {
              id: Date.now(),
              type: "general",
              title: "มีการแจ้งเตือนใหม่!",
              message: "แตะเพื่อดูรายละเอียดในกล่องแจ้งเตือน",
              target_route: null,
            });
          }} className="bg-indigo-500 hover:bg-indigo-600 text-white" size="sm">
            เหมือนในรูป (Like Image)
          </Button>
        </div>
      </div>
    </div>
  );
}

function TestDropDownPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">ตัวอย่างการใช้งาน Dropdown</h2>
      <SimpleExample />
      <TableFilterExample />
      <NotificationExample />
      <ButtonExamples />
      <AlertDemoPage />
      <DemoButtons />
      <SocketDemo />
    </div>
  );
}

export default TestDropDownPage;
