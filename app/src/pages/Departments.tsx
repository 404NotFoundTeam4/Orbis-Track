import { Icon } from "@iconify/react";
import Button from "../components/Button";
import DropDown from "../components/DropDown";
import SearchFilter from "../components/SearchFilter";
import { useEffect, useMemo, useState } from "react";
import DropdownArrow from "../components/DropdownArrow";
import { type GetDepartmentsWithSections } from "../services/DepartmentsService";
import { DepartmentModal } from "../components/DepartmentModal";
import { useToast } from "../components/Toast";
import {
  departmentService,
  sectionService,
} from "../services/DepartmentsService";
import { AlertDialog } from "../components/AlertDialog";

type ModalType =
  | "add-department"
  | "edit-department"
  | "add-section"
  | "edit-section"
  | "delete-section"
  | "delete-department";

const Departments = () => {
  // เก็บข้อมูลแผนกทั้งหมด
  const [departments, setDepartments] = useState<GetDepartmentsWithSections[]>(
    [],
  );
  const { push } = useToast();
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true); // เริ่มโหลด
    try {
      const departmentsData =
        await departmentService.getDepartmentsWithSections();
      setDepartments(departmentsData);
      setDepartmentFilter(
        (prev) => prev ?? { id: "", label: "ทั้งหมด", value: "" },
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      push({ tone: "danger", message: "ไม่สามารถโหลดข้อมูลได้" });
    } finally {
      setLoading(false); // โหลดเสร็จ
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("add-department");
  const [selectedData, setSelectedData] = useState<any>(null);

  // ตัวเลือกแผนกใน Dropdown
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

  // เปิดดูรายการฝ่ายย่อย
  const [openDeptId, setOpenDeptId] = useState<number[]>([]);

  // ใช้เปิด/ปิด Dropdown แต่ละแผนก
  const toggleOpen = (id: number) => {
    // ถ้า id ของแผนกนั้นมีอยู่แล้ว filter ออก ถ้ายังไม่มีให้เพิ่มเข้าไปใน array
    setOpenDeptId((prev) => {
      return prev.includes(id)
        ? prev.filter((deptId) => deptId !== id)
        : [...prev, id];
    });
  };

  const handleModalSubmit = async (data: any) => {
    setLoading(true);
    try {
      switch (modalType) {
        case "edit-department":
          await departmentService.updateDepartment(data.id, {
            department: data.department,
          });
          push({
            tone: "success",
            message: "แก้ไขแผนกเสร็จสิ้น!",
          });
          break;
        case "edit-section":
          await sectionService.updateSection(data.id, data.departmentId, {
            section: data.section,
          });
          push({
            tone: "success",
            message: "แก้ไขฝ่ายย่อยเสร็จสิ้น!",
          });
          break;
        case "add-section":
          await sectionService.addSection({
            dept_id: data.departmentId,
            sec_name: data.section,
          });
          push({
            tone: "success",
            message: "เพิ่มฝ่ายย่อยเสร็จสิ้น!",
          });
          break;
        case "add-department":
          await departmentService.addDepartment({ dept_name: data.department });
          push({
            tone: "success",
            message: "เพิ่มแผนกเสร็จสิ้น!",
          });
          break;

        case "delete-section":
          await sectionService.deleteSection({ sec_id: data.sectionId });
          push({
            tone: "success",
            message: "ลบฝ่ายย่อยเสร็จสิ้น!",
          });
          break;

        case "delete-department":
          await departmentService.deleteDepartment({
            dept_id: data.departmentId,
          });
          push({
            tone: "success",
            message: "ลบแผนกเสร็จสิ้น!",
          });
          break;
      }
    } catch (error: any) {
      push({
        tone: "danger",
        message: "เกิดข้อผิดพลาด",
      });
    } finally {
      setLoading(false);
      setModalOpen(false);
      refreshData();
    }
  };

  const [searchFilter, setSearchFilters] = useState({ search: "" });

  const HandleSort = (
    field: keyof GetDepartmentsWithSections | "statusText",
  ) => {
    if (sortField === field) {
      // ถ้ากด field เดิม → สลับ asc/desc
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // ถ้ากด field ใหม่ → ตั้ง field ใหม่ และเริ่มจาก asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // state เก็บฟิลด์ที่ใช้เรียง เช่น name
  // const [sortField, setSortField] = useState<
  //   keyof GetDepartmentsWithSections | "statusText"
  // >();
  const [sortField, setSortField] = useState<
    keyof GetDepartmentsWithSections | "statusText"
  >("dept_name");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [deleteTarget, setDeleteTarget] = useState<{
    type: string; // ประเภทของสิ่งที่จะลบ
    id: number; // รหัสของ section ที่จะลบ
    name: string; // ชื่อ section (ใช้แสดงข้อความใน Alert)
    deptId?: number; // id ของแผนกที่ section อยู่ (ใช้ตอนอัปเดต state)
    deptName?: string; // ชื่อของแผนก (ใช้โชว์ข้อความ)
  } | null>(null);

  const handleDelete = async () => {
    //ถ้ายังไม่ได้เลือก section ที่จะลบ (deleteTarget = null) ให้ return ออกไปก่อน
    if (!deleteTarget) return;

    try {
      //ตรวจสอบว่าประเภทที่ต้องลบคือ "section"
      if (deleteTarget.type === "section") {
        // ถ้าเป็น section ให้เรียกใช้ service เพื่อลบ section
        await sectionService.deleteSection({ sec_id: deleteTarget.id });

        //แสดงข้อความแจ้งเตือนว่าลบสำเร็จ
        push({
          tone: "danger",
          message: `ลบฝ่ายย่อยเสร็จสิ้น!`,
        });
      } else if (deleteTarget.type === "department") {
        // ถ้าเป็น section ให้เรียกใช้ service เพื่อลบ section
        await departmentService.deleteDepartment({ dept_id: deleteTarget.id });

        //แสดงข้อความแจ้งเตือนว่าลบสำเร็จ
        push({
          tone: "danger",
          message: `ลบแผนกเสร็จสิ้น!`,
        });
      }
    } catch (error) {
      console.error(error);
      push({
        tone: "danger",
        message: "เกิดข้อผิดพลาดในการลบ",
      });
    } finally {
      setDeleteTarget(null);
      refreshData();
    }
  };

  const filtered = useMemo(() => {
    const search = searchFilter.search.trim().toLowerCase();

    let result = departments.filter((dept) => {
      const bySearch = !search || dept.dept_name.toLowerCase().includes(search);

      const byDepartment =
        !departmentFilter?.value || dept.dept_name === departmentFilter.value;

      return bySearch && byDepartment;
    });

    //เริ่มทำการ sort
    result = [...result].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        // sort ชื่อแผนก
        case "dept_name":
          valA = a.dept_name;
          valB = b.dept_name;
          break;
        // sort จำนวนฝ่ายย่อย
        case "sections":
          valA = a.sections.length;
          valB = b.sections.length;
          break;
        case "people_count":
          valA = a.people_count;
          valB = b.people_count;
          break;
        default:
          valA = a.dept_id;
          valB = b.dept_id;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "th")
          : valB.localeCompare(valA, "th");
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
    return result;
  }, [departments, searchFilter, departmentFilter, sortDirection, sortField]);

  //จัดการแบ่งแต่ละหน้า
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [searchFilter, departmentFilter, sortDirection]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const getSortIcon = (
    currentField: string,
    targetField: string,
    direction: "asc" | "desc",
  ) => {
    // ถ้ายังไม่ใช่คอลัมน์ที่กำลัง sort → ใช้ default icon
    if (currentField !== targetField) {
      return "bx:sort-down";
    }

    // ถ้าเป็น asc
    if (direction === "asc") return "bx:sort-up";

    // ถ้าเป็น desc
    return "bx:sort-down";
  };
  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex-1">
        <div>
          {/* แถบนำทาง */}
          <div className="mb-[8px] space-x-[9px]">
            <span className="text-[#858585]">การจัดการ</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#000000]">แผนกและฝ่ายย่อย</span>
          </div>

          {/* ชื่อหน้า */}
          <div className="flex items-center gap-[14px] mb-[21px]">
            <h1 className="text-2xl font-semibold">จัดการแผนกและฝ่ายย่อย</h1>
          </div>

          {/* Filter */}
          <div className="w-full mb-[23px]">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <SearchFilter onChange={setSearchFilters} />
              <div className="flex space-x-[4px]">
                <DropDown
                  items={departmentOptions}
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  placeholder="แผนก"
                />
                <Button
                  onClick={() => {
                    setModalType("add-department");
                    setModalOpen(true);
                  }}
                  size="md"
                  icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}
                >
                  เพิ่มแผนก
                </Button>
                <Button
                  variant="addSection"
                  size="md"
                  icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}
                  onClick={() => {
                    setModalType("add-section"); //เปิด modal หลักแบบเดียวกับเพิ่มแผนก
                    setModalOpen(true); // เปิด modal หลัก
                  }}
                  className="w-[125px]"
                >
                  เพิ่มฝ่ายย่อย
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[718px]">
            <div className="w-full ">
              <div
                className="grid [grid-template-columns:130px_1fr_1fr_1fr_130px]
                                bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[62px] items-center "
              >
                <div className="py-2 px-4 text-left flex items-center"></div>
                <div className="py-2 px-4 text-left flex items-center">
                  แผนก
                  <button type="button" onClick={() => HandleSort("dept_name")}>
                    <Icon
                      icon={getSortIcon(sortField, "dept_name", sortDirection)}
                      width="28"
                      height="28"
                      className="ml-1"
                    />
                  </button>
                </div>
                <div className="py-2 px-4 text-left flex items-center">
                  จำนวนฝ่ายย่อย
                  <button type="button" onClick={() => HandleSort("sections")}>
                    <Icon
                      icon={getSortIcon(sortField, "sections", sortDirection)}
                      width="28"
                      height="28"
                      className="ml-1"
                    />
                  </button>
                </div>
                <div className="py-2 px-4 text-left flex items-center">
                  จำนวนคน
                  <button
                    type="button"
                    onClick={() => HandleSort("people_count")}
                  >
                    <Icon
                      icon={getSortIcon(
                        sortField,
                        "people_count",
                        sortDirection,
                      )}
                      width="28"
                      height="28"
                      className="ml-1"
                    />
                  </button>
                </div>
                <div className="py-2 px-4 text-left flex items-center">
                  จัดการ
                </div>
              </div>
              {pageRows.map((dep) => (
                <div
                  key={dep.dept_id}
                  onClick={() => toggleOpen(dep.dept_id)}
                  className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-[16px] mt-[16px] mb-[16px] hover:bg-gray-50 overflow-hidden"
                  // onClick={() => toggleOpen(dep.dept_id)}
                >
                  <div className="grid [grid-template-columns:130px_1fr_1fr_1fr_130px] mt-[30px] mb-[30px] items-center text-[16px] ">
                    {/* Dropdown Arrow */}
                    <div
                      className="py-2 px-4 flex justify-center items-center hover:cursor-pointer"
                      // onClick={() => toggleOpen(dep.dept_id)}
                    >
                      <DropdownArrow
                        isOpen={openDeptId.includes(dep.dept_id)}
                      />
                    </div>
                    {/* ชื่อแผนก */}
                    <div className="py-2 px-4 flex flex-col gap-2">
                      {dep.dept_name}
                    </div>
                    {/* จำนวนฝ่ายย่อย */}
                    <div className="py-2 px-4">
                      <span className="bg-[#EBF3FE] rounded-[16px] w-[88px] h-[34px] inline-flex items-center justify-center">
                        {dep.sections.length} ฝ่ายย่อย
                      </span>
                    </div>
                    {/* จำนวนคนในแผนก */}
                    <div className="py-2 px-4">
                      <span className="bg-[#EBF3FE] rounded-[16px] w-[88px] h-[34px] inline-flex items-center justify-center">
                        {dep.people_count} คน
                      </span>
                    </div>
                    {/* จัดการ */}
                    <div>
                      <div className="py-2 px-4 flex items-center gap-3">
                        <button
                          style={{ cursor: "pointer" }}
                          type="submit"
                          className="w-[34px] h-[34px] flex items-center justify-center
                          text-[#1890FF] hover:bg-[#40A9FF] hover:text-[#FFFFFF]
                          rounded-[8px] transition-all duration-150"
                          title="แก้ไข"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalType("edit-department");
                            setSelectedData({
                              id: Number(dep.dept_id),
                              department: dep.dept_name,
                            });
                            setModalOpen(true);
                          }}
                        >
                          <Icon
                            icon="prime:pen-to-square"
                            width="28"
                            height="28"
                          />
                        </button>
                        {dep.people_count <= 0 && (
                          <button
                            style={{ cursor: "pointer" }}
                            type="submit"
                            className="w-[34px] h-[34px] flex items-center justify-center
                            text-[#FF4D4F] hover:bg-[#FF7875] hover:text-[#FFFFFF]
                            rounded-[8px] transition-all duration-150"
                            title="ลบ"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                type: "department", // ระบุเป็น department
                                id: Number(dep.dept_id), // id ของ department
                                name: dep.dept_name, // ชื่อ department
                              });
                            }}
                          >
                            <Icon
                              icon="solar:trash-bin-trash-outline"
                              width="28"
                              height="28"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {
                    // ถ้า openDeptId เปิดอยู่ (แสดงฝ่ายย่อย)
                    openDeptId.includes(dep.dept_id) && (
                      <div className="flex flex-col gap-5 mt-[30px] mb-[30px]">
                        <hr className="border-t border-gray-200 mx-[60px]" />
                        {dep.sections.map((section: any, index: any) => (
                          <div
                            key={index}
                            className="grid [grid-template-columns:130px_1fr_1fr_1fr_130px] h-[35px] items-center hover:bg-gray-50 text-[16px]"
                          >
                            {/* พื้นที่ว่าง */}
                            <div className="py-2 px-4"></div>
                            {/* ชื่อฝ่ายย่อย */}
                            <div className="py-2 px-4">{section.sec_name}</div>
                            {/* พื้นที่ว่าง */}
                            <div className="py-2 px-4"></div>
                            {/* จำนวนคนในแผนก */}
                            <div className="py-2 px-4">
                              <span className="bg-[#EBF3FE] rounded-[16px] w-[88px] h-[34px] inline-flex items-center justify-center">
                                {section.people_count} คน
                              </span>
                            </div>
                            {/* จัดการ */}
                            <div>
                              <div className="py-2 px-4 flex items-center gap-3">
                                <button
                                  style={{ cursor: "pointer" }}
                                  type="submit"
                                  className="w-[34px] h-[34px] flex items-center justify-center
                                  text-[#1890FF] hover:bg-[#40A9FF] hover:text-[#FFFFFF]
                                  rounded-[8px] transition-all duration-150"
                                  title="แก้ไข"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setModalType("edit-section");
                                    setSelectedData({
                                      sectionId: Number(section.sec_id),
                                      department: dep.dept_name,
                                      departmentId: Number(dep.dept_id),
                                      section: section.sec_name,
                                    });
                                    setModalOpen(true);
                                  }}
                                >
                                  <Icon
                                    icon="prime:pen-to-square"
                                    width="28"
                                    height="28"
                                  />
                                </button>
                                {section.people_count <= 0 && (
                                  <button
                                    style={{ cursor: "pointer" }}
                                    type="submit"
                                    className="w-[34px] h-[34px] flex items-center justify-center
                                    text-[#FF4D4F] hover:bg-[#FF7875] hover:text-[#FFFFFF]
                                    rounded-[8px] transition-all duration-150"
                                    title="ลบ"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({
                                        type: "section", // ระบุเป็น section
                                        id: Number(section.sec_id), // id ของ section
                                        name: section.sec_name, // ชื่อฝ่ายย่อย
                                        deptId: Number(dep.dept_id), // id ของ department สำหรับอัปเดต state
                                        deptName: dep.dept_name, // ชื่อแผนก สำหรับแสดงใน alert
                                      });
                                    }}
                                  >
                                    <Icon
                                      icon="solar:trash-bin-trash-outline"
                                      width="28"
                                      height="28"
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
          </div>

          {/* ปุ่มหน้า */}
          <div className="mt-auto py-4 mr-6 flex items-center justify-end">
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
      {/* Modal */}
      <DepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        // departments={departments.map((d) => ({
        //   id: d.dept_id,
        //   name: d.dept_name,
        // }))}
        departments={departments.map((d) => ({
          id: d.dept_id,
          name: d.dept_name,
          sections: d.sections.map((s) => ({
            id: s.sec_id,
            name: s.sec_name,
          })),
        }))}
        initialData={selectedData}
        onSubmit={handleModalSubmit}
      />
      {deleteTarget && (
        <AlertDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          className="border-[1px] border-[#858585] mgr-4 rounded-[42px] p-6 height-[400px]"
          width={786}
          onConfirm={handleDelete}
          tone="danger"
          title={`คุณแน่ใจหรือไม่ว่าต้องการลบ${deleteTarget.type === "section" ? `${deleteTarget.name}` : `แผนก${/^[A-Za-z]+$/.test(deleteTarget.name) ? " " : ""}${deleteTarget.name}`}`}
          description={
            deleteTarget.type === "section" ? (
              <>
                {deleteTarget.name}
                {/^[A-Za-z]+$/.test(
                  deleteTarget.name
                    .replace(/^ฝ่ายย่อย/i, "")
                    .replace(/\s+/g, "") //ตัดช่องว่างทั้งหมด
                    .trim(),
                )
                  ? " "
                  : ""}
                ในแผนก
                {/^[A-Za-z]+$/.test(deleteTarget.deptName ?? "") ? " " : ""}
                {deleteTarget.deptName}
                {/^[A-Za-z]+$/.test(deleteTarget.deptName ?? "") ? " " : ""}
                จะถูกลบ
                <br />
                และการดำเนินการนี้ไม่สามารถกู้คืนได้
              </>
            ) : (
              <>
                ฝ่ายย่อยในแผนก{/^[A-Za-z]+$/.test(deleteTarget.name) ? " " : ""}
                {deleteTarget.name}
                {/^[A-Za-z]+$/.test(deleteTarget.name) ? " " : ""}จะถูกลบทั้งหมด
                <br />
                และการดำเนินการนี้ไม่สามารถกู้คืนได้
              </>
            )
          }
        />
      )}
    </div>
  );
};

export default Departments;
