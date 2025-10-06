import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import UserFilter from "../components/UserFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownShortWide,
  faArrowUpShortWide,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";

interface User {
  id: number;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  subDepartment: string;
  phone: string;
  dateAdded: string;
  status: boolean;
  email: string;
  imageUrl: string;
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
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4305",
      dateAdded: "2025-08-20",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 2,
      name: "นายอาทิวัฒน์ มีตัว",
      employeeId: "789101",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4305",
      dateAdded: "2025-08-21",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 3,
      name: "น.ส.กมลชนก ศรีประเสริฐ",
      employeeId: "789102",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4306",
      dateAdded: "2025-08-19",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 4,
      name: "นายพงศธร วัฒนากูล",
      employeeId: "789103",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4307",
      dateAdded: "2025-08-18",
      status: false,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 5,
      name: "น.ส.ธนิกานต์ ชัยมงคล",
      employeeId: "789104",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4308",
      dateAdded: "2025-08-17",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 6,
      name: "นายภูริภัทร เกียรติไกร",
      employeeId: "789105",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4309",
      dateAdded: "2025-08-16",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 7,
      name: "น.ส.ปาณิสรา แสงสุริยา",
      employeeId: "789106",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4310",
      dateAdded: "2025-08-15",
      status: false,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 8,
      name: "นายณัฐนนท์ มีศักดิ์",
      employeeId: "789107",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4311",
      dateAdded: "2025-08-14",
      status: false,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 9,
      name: "น.ส.สุพิชญา รัตนชัย",
      employeeId: "789108",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4312",
      dateAdded: "2025-08-13",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 10,
      name: "นายธีรดนย์ บุณยรัตน์",
      employeeId: "789109",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4313",
      dateAdded: "2025-08-12",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 11,
      name: "น.ส.จิราภรณ์ สุนทรศักดิ์",
      employeeId: "789110",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4314",
      dateAdded: "2025-08-11",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 12,
      name: "นายศุภกฤต พิพัฒน์ไทย",
      employeeId: "789111",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4315",
      dateAdded: "2025-08-10",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 13,
      name: "น.ส.รพีพร จันทร์เพ็ญ",
      employeeId: "789112",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4316",
      dateAdded: "2025-08-09",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 14,
      name: "นายตะวัน คงรักษ์",
      employeeId: "789113",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4317",
      dateAdded: "2025-08-08",
      status: false,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 15,
      name: "น.ส.ปวีณา ตรีวัฒน์",
      employeeId: "789114",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4318",
      dateAdded: "2025-08-07",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 16,
      name: "นายธนกฤต อินทรโชติ",
      employeeId: "789115",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4319",
      dateAdded: "2025-08-06",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 17,
      name: "น.ส.ชนิสรา บวรุตม์",
      employeeId: "789116",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4320",
      dateAdded: "2025-08-05",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 18,
      name: "นายปฐมพงศ์ ชาญชัย",
      employeeId: "789117",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4321",
      dateAdded: "2025-08-04",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 19,
      name: "น.ส.ธัญชนก กิตติคุณ",
      employeeId: "789118",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Marketing",
      subDepartment: "A",
      phone: "095-461-4322",
      dateAdded: "2025-08-03",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 20,
      name: "นายณภัทร รุ่งเรือง",
      employeeId: "789119",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Media",
      subDepartment: "F",
      phone: "095-461-4323",
      dateAdded: "2025-08-02",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 21,
      name: "น.ส.ภัสสรา ศักดิ์สิทธิ์",
      employeeId: "789120",
      email: "Giga@xxxxx.com",
      position: "Team Leader",
      department: "Media",
      subDepartment: "A",
      phone: "095-461-4324",
      dateAdded: "2025-08-01",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
    },
    {
      id: 22,
      name: "นายกิตติภูมิ อนงค์ชัย",
      employeeId: "789121",
      email: "Giga@xxxxx.com",
      position: "Support Manager",
      department: "Marketing",
      subDepartment: "F",
      phone: "095-461-4325",
      dateAdded: "2025-08-22",
      status: true,
      imageUrl:
        "https://cdn-useast1.kapwing.com/static/templates/crying-cat-meme-template-regular-096fc808.webp",
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
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">บัญชีผู้ใช้</span>
        </div>
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold">จัดการบัญชีผู้ใช้</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            ผู้ใช้งานทั้งหมด {users.length}
          </div>
        </div>
        <div className="mb-[23px]">
          <UserFilter
            onChange={setFilters}
            positions={positionOptions}
            departments={departmentOptions}
            subDepartments={subDeptOptions}
          />
        </div>

        <div className="w-[1655px]">
          {/* หัวตาราง */}
          <div
            className="grid [grid-template-columns:351px_220px_203px_183px_188px_179px_166px_81px]
              bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center"
          >
            <div className="py-2 px-4 text-left flex items-center">
              ชื่อผู้ใช้
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              ตำแหน่ง
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              แผนก
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              ฝ่ายย่อย
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left">เบอร์ติดต่อ</div>
            <div className="py-2 px-4 text-left">
              วันที่เพิ่ม
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left">
              สถานะ
              <button type="button" onClick={toggleSortDate}>
                <Icon
                  icon={sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up"}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left">จัดการ</div>
          </div>

          <div className="border border-[#D9D9D9] rounded-[16px]">
            {/* แถวข้อมูล */}
            {pageRows.map((user) => (
              <div
                key={user.id}
                className="grid [grid-template-columns:351px_220px_203px_183px_188px_179px_166px_81px]
                 items-center hover:bg-gray-50"
              >
                {/* ชื่อผู้ใช้ */}
                <div className="py-2 px-4 flex items-center">
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div>{user.name}</div>
                    <div>
                      <span className="text-blue-600">{user.email} : </span>
                      <span>{user.employeeId}</span>
                    </div>
                  </div>
                </div>

                <div className="py-2 px-4">{user.position}</div>
                <div className="py-2 px-4">{user.department}</div>
                <div className="py-2 px-4">{user.subDepartment}</div>
                <div className="py-2 px-4">{user.phone}</div>
                <div className="py-2 px-4">
                  {formatThaiDate(user.dateAdded)}
                </div>

                <div className="py-2 px-4">
                  {user.status ? (
                    <span className="flex items-center justify-center w-[120px] h-[35px] border border-green-400 text-green-500 rounded-full text-base">
                      ใช้งานได้ปกติ
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-[120px] h-[35px] border border-red-400 text-red-500 rounded-full text-base">
                      ถูกปิดการใช้งาน
                    </span>
                  )}
                </div>

                <div>
                  {user.status ? (
                    <div className="py-2 px-4 flex items-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        title="แก้ไข"
                      >
                        <Icon
                          icon="prime:pen-to-square"
                          width="22"
                          height="22"
                        />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        title="ลบ"
                      >
                        <Icon
                          icon="solar:trash-bin-trash-outline"
                          width="22"
                          height="22"
                        />
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            ))}

            {/* ปุ่มหน้า */}
            <div className="mt-3 mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
              {/* ขวา: ตัวแบ่งหน้า */}
              <div className="flex items-center gap-2">
                {/* ปุ่มก่อนหน้า */}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-[gray-50]"
                >
                  {"<"}
                </button>

                {/* หน้า 1 */}
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className={`h-8 min-w-8 px-2 rounded border text-sm ${page === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
                >
                  1
                </button>

                {/* หน้าปัจจุบันถ้าไม่ใช่ 1 และไม่ใช่หน้าสุดท้าย แสดงด้วยกรอบดำ */}
                {page > 2 && <span className="px-1 text-gray-400">…</span>}
                {page > 1 && page < totalPages && (
                  <button
                    type="button"
                    className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
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
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${page === totalPages ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
                  >
                    {totalPages}
                  </button>
                )}

                {/* ถัดไป */}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
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
                    className="h-8 w-14 rounded border border-[#D9D9D9] px-2 text-sm"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
