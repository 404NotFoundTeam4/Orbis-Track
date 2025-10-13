import { useMemo, useState } from "react";
import Dropdown from "../components/DropDown";
import Button from "../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

/**
 * Component: SimpleExample
 * Description: ตัวอย่างการใช้งาน Dropdown แบบง่ายที่สุด
 */
function SimpleExample() {
  const [selectedFruit, setSelectedFruit] = useState<any>(null);

  const fruits = [
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

function TestDropDownPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">ตัวอย่างการใช้งาน Dropdown</h2>
      <SimpleExample />
      <TableFilterExample />
      <ButtonExamples />
    </div>
  );
}

export default TestDropDownPage;
