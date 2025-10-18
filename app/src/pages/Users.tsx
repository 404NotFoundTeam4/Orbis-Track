import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import { Icon } from "@iconify/react";
import axios from "axios";

type User = {
  us_id: number;
  us_emp_code: string;
  us_firstname: string;
  us_lastname: string;
  us_username: string;
  us_email: string;
  us_phone: string;
  us_images: string;
  us_role: string;
  us_dept_id: number;
  us_sec_id: number;
  us_is_active: boolean;
  us_dept_name: string;
  us_sec_name: string;
  created_at: Date;
};

type Section = {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
};

type Department = {
  dept_id: number;
  dept_name: string;
};

export const Users = () => {
  //ตั้งข้อมูล section ไว้ใช้ใน filter
  const [sections, setSections] = useState<Section[]>([]);
  const sectionOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...sections.map((s) => ({
      id: s.sec_id,
      label: s.sec_name,
      value: s.sec_name,
    })),
  ];
  const [sectionFilter, setSectionFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);
  //ตั้งข้อมูล department ไว้ใช้ใน filter
  const [departments, setDepartments] = useState<Department[]>([]);
  const departmentOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...departments.map((d) => ({
      id: d.dept_id,
      label: d.dept_name,
      value: d.dept_name,
    })),
  ];
  const [departmentFilter, setDepartmentFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);

  const [users, setusers] = useState<User[]>([]);
  //ตั้งข้อมูล role ไว้ใช้ใน filter
  const roleOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...Array.from(
      new Set(users.map((u) => u.us_role)) // ตัดซ้ำ
    ).map((r, index) => ({
      id: index + 1,
      label: r,
      value: r,
    })),
  ];
  // const [roleFilter, setRoleFilters] = useState({ option: "" });
  const [roleFilter, setRoleFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);

  //Search Filter
  const [searchFilter, setSearchFilters] = useState({
    search: "",
  });

  //ดึงข้อมูล api จาก back-end
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/accounts");
      const data = res.data;

      setSections(data.data.sections || []);
      setDepartments(data.data.departments || []);
      setusers(data.data.userWithDetails || []);
    };

    fetchData();
  }, []);

  /**
   * Description: แปลงวันที่
   * Input : iso: string
   * Output : `${day} / ${month} / ${year}`
   * Author : Nontapat Sinhum (Guitar) 66160104
   */

  const FormatThaiDate = (iso: string | Date) => {
    const d = new Date(iso);
    const day = d.getDate(); // วัน
    const month = d.toLocaleString("th-TH", { month: "short" }); // เดือนแบบย่อ
    const year = d.getFullYear() + 543; // แปลง ค.ศ. → พ.ศ.
    return `${day} ${month} ${year}`;
  };

  // state เก็บฟิลด์ที่ใช้เรียง เช่น name
  const [sortField, setSortField] = useState<keyof User | "statusText">();
  ("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /**
   * Description: เปลี่ยน field ที่ต้องการจะเรีบง หรือ เปลี่ยนลักษณะการเรียง
   * Input : field: keyof User | "statusText"
   * Output :
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  const HandleSort = (field: keyof User | "statusText") => {
    if (sortField === field) {
      // ถ้ากด field เดิม → สลับ asc/desc
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // ถ้ากด field ใหม่ → ตั้ง field ใหม่ และเริ่มจาก asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    const search = searchFilter.search.trim().toLowerCase();
    let result = users.filter((u) => {
      const bySearch =
        !search ||
        [
          u.us_firstname,
          u.us_lastname,
          u.us_emp_code,
          u.us_role,
          u.us_dept_name,
          u.us_sec_name,
          u.us_phone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const byRole = !roleFilter?.value || u.us_role === roleFilter.value;
      const byDep =
        !departmentFilter?.value || u.us_dept_name === departmentFilter.value;
      const bySec =
        !sectionFilter?.value || u.us_sec_name === sectionFilter.value;
      return bySearch && byRole && byDep && bySec;
    });

    //เริ่มทำการ sort
    result = [...result].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case "us_firstname":
          valA = `${a.us_firstname} ${a.us_lastname}`;
          valB = `${b.us_firstname} ${b.us_lastname}`;
          break;
        case "us_role":
          valA = a.us_role;
          valB = b.us_role;
          break;
        case "us_dept_name":
          valA = a.us_dept_name;
          valB = b.us_dept_name;
          break;
        case "us_sec_name":
          valA = a.us_sec_name;
          valB = b.us_sec_name;
          break;
        case "us_is_active":
          valA = a.us_is_active ? 1 : 0;
          valB = b.us_is_active ? 1 : 0;
          break;
        case "created_at":
          valA = new Date(a.created_at).getTime(); // แปลงเป็น timestamp
          valB = new Date(b.created_at).getTime();
          break;
        default:
          valA = a.us_id;
          valB = b.us_id;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "th")
          : valB.localeCompare(valA, "th");
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
    return result;
  }, [
    users,
    searchFilter,
    roleFilter,
    departmentFilter,
    sectionFilter,
    sortDirection,
  ]);

  //จัดการแบ่งแต่ละหน้า
  const [page, setPage] = useState(1);
  const pageSize = 20; // 10/20/50 ก็ได้

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [
    searchFilter,
    roleFilter,
    departmentFilter,
    sectionFilter,
    sortDirection,
  ]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      <div className="flex-1">
        {/* แถบนำทาง */}
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">บัญชีผู้ใช้</span>
        </div>

        {/* ชื่อหน้า */}
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold">จัดการบัญชีผู้ใช้</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            ผู้ใช้งานทั้งหมด {users.length}
          </div>
        </div>

        {/* Filter */}
        <div className="w-full mb-[23px]">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
            <SearchFilter onChange={setSearchFilters} />
            <div className="flex space-x-[4px]">
              <Dropdown
                items={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="ตำแหน่ง"
              />
              <Dropdown
                items={departmentOptions}
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="แผนก"
              />
              <Dropdown
                items={sectionOptions}
                value={sectionFilter}
                onChange={setSectionFilter}
                placeholder="ฝ่ายย่อย"
              />
              {/* <AddButton label="บัญชีผู้ใช้" /> */}
              <Button
                size="md"
                icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}
              >
                เพิ่มบัญชีผู้ใช้
              </Button>
            </div>
          </div>
        </div>

        {/* ตาราง */}
        <div className="w-[1655px]">
          {/* หัวตาราง */}
          <div
            className="grid [grid-template-columns:400px_130px_203px_230px_160px_150px_180px_81px]
              bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center gap-3"
          >
            <div className="py-2 px-4 text-left flex items-center">
              ชื่อผู้ใช้
              <button type="button" onClick={() => HandleSort("us_firstname")}>
                <Icon
                  icon={
                    sortField === "us_firstname"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              ตำแหน่ง
              <button type="button" onClick={() => HandleSort("us_role")}>
                <Icon
                  icon={
                    sortField === "us_role"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              แผนก
              <button type="button" onClick={() => HandleSort("us_dept_name")}>
                <Icon
                  icon={
                    sortField === "us_dept_name"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              ฝ่ายย่อย
              <button type="button" onClick={() => HandleSort("us_sec_name")}>
                <Icon
                  icon={
                    sortField === "us_sec_name"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              เบอร์ติดต่อ
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              วันที่เพิ่ม
              <button type="button" onClick={() => HandleSort("created_at")}>
                <Icon
                  icon={
                    sortField === "created_at"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              สถานะ
              <button type="button" onClick={() => HandleSort("us_is_active")}>
                <Icon
                  icon={
                    sortField === "us_is_active"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down" //default icon
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">จัดการ</div>
          </div>

          <div className="border border-[#D9D9D9] rounded-[16px]">
            {/* แถวข้อมูล */}
            {pageRows.map((u) => (
              <div
                key={u.us_id}
                // 400px_100px_203px_230px_188px_179px_166px_81px
                className="grid [grid-template-columns:400px_130px_203px_230px_160px_150px_180px_81px] 
                 items-center hover:bg-gray-50 text-[16px] gap-3"
              >
                {/* ชื่อผู้ใช้ */}
                <div className="py-2 px-4 flex items-center">
                  <img
                    src={u.us_images}
                    alt={u.us_firstname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div>{`${u.us_firstname} ${u.us_lastname}`}</div>
                    <div>
                      <span className="text-blue-600">{u.us_email} : </span>
                      <span>{u.us_emp_code}</span>
                    </div>
                  </div>
                </div>

                <div className="py-2 px-4">{u.us_role}</div>
                <div className="py-2 px-4">{u.us_dept_name}</div>
                <div className="py-2 px-4">{u.us_sec_name}</div>
                <div className="py-2 px-4">{u.us_phone}</div>
                <div className="py-2 px-4">{FormatThaiDate(u.created_at)}</div>

                <div className="py-2 px-4">
                  {u.us_is_active ? (
                    <span className="flex items-center justify-center w-[120px] h-[35px] border border-[#73D13D] text-[#73D13D] rounded-full text-base">
                      ใช้งานได้ปกติ
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-[120px] h-[35px] border border-[#FF4D4F] text-[#FF4D4F] rounded-full text-base">
                      ถูกปิดการใช้งาน
                    </span>
                  )}
                </div>

                <div>
                  {u.us_is_active ? (
                    <div className="py-2 px-4 flex items-center gap-3">
                      <button
                        className="text-[#1890FF] hover:text-[#1890FF]"
                        title="แก้ไข"
                      >
                        <Icon
                          icon="prime:pen-to-square"
                          width="22"
                          height="22"
                        />
                      </button>
                      <button
                        className="text-[#FF4D4F] hover:text-[#FF4D4F]"
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
