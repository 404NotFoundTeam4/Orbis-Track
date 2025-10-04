// export const Users = () => {
//   return (
//     <>
//       <div>
//         <span>การจัดการ &gt;</span>
//         <span>บัญชีผู้ใช้</span>
//       </div>
//       <h1>จัดการบัญชีผู้ใช้</h1>
//       <table className="border-separate border border-gray-400 ...">
//         <thead>
//           <tr>
//             <th>ชื่อผู้ใช้</th>
//             <th>ตำแหน่ง</th>
//             <th>แผนก</th>
//             <th>ฝ่ายย่อย</th>
//             <th>เบอร์ติดต่อ</th>
//             <th>วันที่เพิ่ม</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>John Doe</td>
//             <td>Developer</td>
//             <td>IT</td>
//             <td>Software</td>
//             <td>095-123-4567</td>
//             <td>2025-08-22</td>
//           </tr>
//         </tbody>
//       </table>
//     </>
//   );
// };
// export default Users;

import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import UserFilter from "../components/UserFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownShortWide,
  faArrowUpShortWide,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

interface User {
  id: number;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  subDepartment: string;
  phone: string;
  dateAdded: string;
}

//ตั้งข้อมูลใน dropdown
const positionOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "Team Leader", value: "Team Leader" },
  { label: "Support Manager", value: "Support Manager" },
];

const departmentOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "Marketing", value: "Marketing" },
  { label: "Media", value: "Media" },
];

const subDeptOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "F", value: "F" },
  { label: "A", value: "A" },
];

export const Users = () => {
  // ข้อมูลผู้ใช้ตัวอย่าง
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "นายทศพล อนุชัย",
      employeeId: "123456",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4305",
      dateAdded: "2025-08-20",
    },
    {
      id: 2,
      name: "นายอาทิวัฒน์ มีตัว",
      employeeId: "789101",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4305",
      dateAdded: "2025-08-21",
    },
    {
      id: 3,
      name: "น.ส.กมลชนก ศรีประเสริฐ",
      employeeId: "789102",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4306",
      dateAdded: "2025-08-19",
    },
    {
      id: 4,
      name: "นายพงศธร วัฒนากูล",
      employeeId: "789103",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4307",
      dateAdded: "2025-08-18",
    },
    {
      id: 5,
      name: "น.ส.ธนิกานต์ ชัยมงคล",
      employeeId: "789104",
      position: "Team Leader",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4308",
      dateAdded: "2025-08-17",
    },
    {
      id: 6,
      name: "นายภูริภัทร เกียรติไกร",
      employeeId: "789105",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4309",
      dateAdded: "2025-08-16",
    },
    {
      id: 7,
      name: "น.ส.ปาณิสรา แสงสุริยา",
      employeeId: "789106",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4310",
      dateAdded: "2025-08-15",
    },
    {
      id: 8,
      name: "นายณัฐนนท์ มีศักดิ์",
      employeeId: "789107",
      position: "Support Manager",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4311",
      dateAdded: "2025-08-14",
    },
    {
      id: 9,
      name: "น.ส.สุพิชญา รัตนชัย",
      employeeId: "789108",
      position: "Team Leader",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4312",
      dateAdded: "2025-08-13",
    },
    {
      id: 10,
      name: "นายธีรดนย์ บุณยรัตน์",
      employeeId: "789109",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4313",
      dateAdded: "2025-08-12",
    },
    {
      id: 11,
      name: "น.ส.จิราภรณ์ สุนทรศักดิ์",
      employeeId: "789110",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4314",
      dateAdded: "2025-08-11",
    },
    {
      id: 12,
      name: "นายศุภกฤต พิพัฒน์ไทย",
      employeeId: "789111",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4315",
      dateAdded: "2025-08-10",
    },
    {
      id: 13,
      name: "น.ส.รพีพร จันทร์เพ็ญ",
      employeeId: "789112",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4316",
      dateAdded: "2025-08-09",
    },
    {
      id: 14,
      name: "นายตะวัน คงรักษ์",
      employeeId: "789113",
      position: "Support Manager",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4317",
      dateAdded: "2025-08-08",
    },
    {
      id: 15,
      name: "น.ส.ปวีณา ตรีวัฒน์",
      employeeId: "789114",
      position: "Team Leader",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4318",
      dateAdded: "2025-08-07",
    },
    {
      id: 16,
      name: "นายธนกฤต อินทรโชติ",
      employeeId: "789115",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4319",
      dateAdded: "2025-08-06",
    },
    {
      id: 17,
      name: "น.ส.ชนิสรา บวรุตม์",
      employeeId: "789116",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4320",
      dateAdded: "2025-08-05",
    },
    {
      id: 18,
      name: "นายปฐมพงศ์ ชาญชัย",
      employeeId: "789117",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4321",
      dateAdded: "2025-08-04",
    },
    {
      id: 19,
      name: "น.ส.ธัญชนก กิตติคุณ",
      employeeId: "789118",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4322",
      dateAdded: "2025-08-03",
    },
    {
      id: 20,
      name: "นายณภัทร รุ่งเรือง",
      employeeId: "789119",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4323",
      dateAdded: "2025-08-02",
    },
    {
      id: 21,
      name: "น.ส.ภัสสรา ศักดิ์สิทธิ์",
      employeeId: "789120",
      position: "Team Leader",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4324",
      dateAdded: "2025-08-01",
    },
    {
      id: 22,
      name: "นายกิตติภูมิ อนงค์ชัย",
      employeeId: "789121",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4325",
      dateAdded: "2025-08-22",
    },
  ]);

  // helper: แปลง ISO -> "21 / ส.ค. / 2568"
  const formatThaiDate = (iso: string) => {
    const d = new Date(iso);
    const day = d.toLocaleDateString("th-TH", { day: "2-digit" }); // 21
    const month = d.toLocaleDateString("th-TH", { month: "short" }); // ส.ค.
    const year = d.getFullYear() + 543; // แปลง ค.ศ. -> พ.ศ.
    return `${day} / ${month} / ${year}`;
  };

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSortDate = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // filterข้อมูล
  const [filters, setFilters] = useState({
    search: "",
    position: "",
    department: "",
    subDepartment: "",
  });

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    let result = users.filter((u) => {
      const bySearch =
        !search ||
        [
          u.name,
          u.employeeId,
          u.position,
          u.department,
          u.subDepartment,
          u.phone,
          u.dateAdded,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const byPos = !filters.position || u.position === filters.position;
      const byDep = !filters.department || u.department === filters.department;
      const bySub =
        !filters.subDepartment || u.subDepartment === filters.subDepartment;
      return bySearch && byPos && byDep && bySub;
    });

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [users, filters, sortDirection]);

  //จัดการแบ่งแต่ละหน้า
  const [page, setPage] = useState(1);
  const pageSize = 20; // 10/20/50 ก็ได้

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [filters, sortDirection]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      <div className="flex-1">
        <div className="mb-4">
          <span className="text-gray-700">การจัดการ &gt;</span>
          <span className="text-blue-600">บัญชีผู้ใช้</span>
        </div>
        <h1 className="text-2xl font-semibold mb-4">จัดการบัญชีผู้ใช้</h1>
        <div>
          <UserFilter
            total={users.length}
            onChange={setFilters}
            positions={positionOptions}
            departments={departmentOptions}
            subDepartments={subDeptOptions}
          />
        </div>
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">
                <span>ชื่อผู้ใช้ </span>
                <span>
                  <button type="button" onClick={toggleSortDate}>
                    <FontAwesomeIcon
                      icon={
                        sortDirection === "asc"
                          ? faArrowUpShortWide
                          : faArrowDownShortWide
                      }
                      className="ml-1 "
                    />
                  </button>
                </span>
              </th>
              <th className="py-2 px-4 border-b text-left">ตำแหน่ง</th>
              <th className="py-2 px-4 border-b text-left">แผนก</th>
              <th className="py-2 px-4 border-b text-left">ฝ่ายย่อย</th>
              <th className="py-2 px-4 border-b text-left">เบอร์ติดต่อ</th>
              <th className="py-2 px-4 border-b text-left">
                <span>วันที่เพิ่ม </span>
                <span>
                  <button type="button" onClick={toggleSortDate}>
                    <FontAwesomeIcon
                      icon={
                        sortDirection === "asc"
                          ? faArrowUpShortWide
                          : faArrowDownShortWide
                      }
                      className="ml-1 "
                    />
                  </button>
                </span>
              </th>
              <th className="py-2 px-4 border-b text-left"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  <div>{user.name}</div>
                  <div>
                    <span className="text-blue-600">รหัสพนักงาน : </span>
                    <span>{user.employeeId}</span>
                  </div>
                </td>
                <td className="py-2 px-4">{user.position}</td>
                <td className="py-2 px-4">{user.department}</td>
                <td className="py-2 px-4">{user.subDepartment}</td>
                <td className="py-2 px-4">{user.phone}</td>
                <td className="py-2 px-4">{formatThaiDate(user.dateAdded)}</td>
                <td className="py-2 px-4">
                  <button className="flex items-center justify-center text-blue-500 hover:text-blue-700">
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 border-t pt-3 flex items-center justify-end">
        {/* ขวา: ตัวแบ่งหน้า */}
        <div className="flex items-center gap-2">
          {/* ปุ่มก่อนหน้า */}
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-gray-400 disabled:bg-gray-50"
          >
            {"<"}
          </button>

          {/* หน้า 1 */}
          <button
            type="button"
            onClick={() => setPage(1)}
            className={`h-8 min-w-8 px-2 rounded border text-sm ${page === 1 ? "border-blue-500 text-blue-600" : ""}`}
          >
            1
          </button>

          {/* หน้าปัจจุบันถ้าไม่ใช่ 1 และไม่ใช่หน้าสุดท้าย แสดงด้วยกรอบน้ำเงิน */}
          {page > 2 && <span className="px-1 text-gray-400">…</span>}
          {page > 1 && page < totalPages && (
            <button
              type="button"
              className="h-8 min-w-8 px-2 rounded border text-sm border-blue-500 text-blue-600"
            >
              {page}
            </button>
          )}
          {page < totalPages - 1 && (
            <span className="px-1 text-gray-400">…</span>
          )}

          {/* หน้าสุดท้าย (ถ้ามากกว่า 1) */}
          {totalPages > 1 && (
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={`h-8 min-w-8 px-2 rounded border text-sm ${page === totalPages ? "border-blue-500 text-blue-600" : ""}`}
            >
              {totalPages}
            </button>
          )}

          {/* ถัดไป */}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-gray-400 disabled:bg-gray-50"
          >
            {">"}
          </button>

          {/* ไปหน้าที่ */}
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const v = Number(fd.get("goto"));
                if (!Number.isNaN(v))
                  setPage(Math.min(totalPages, Math.max(1, v)));
              }
            }}
            className="flex items-center gap-1"
          >
            <span>ไปที่หน้า</span>
            <input
              name="goto"
              type="number"
              min={1}
              max={totalPages}
              className="h-8 w-14 rounded border px-2 text-sm"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
