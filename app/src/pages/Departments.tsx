import { Icon } from "@iconify/react"
import Button from "../components/Button"
import DropDown from "../components/DropDown"
import SearchFilter from "../components/SearchFilter"
import { useEffect, useMemo, useState } from "react"
import DropdownArrow from "../components/DropdownArrow"
import axios from "axios"
import PopupAddSection from "../components/PopupAddSection"

const mockUpDepartment = [
    {
        dept_id: 1,
        dept_name: "คลังสินค้า",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B", "ฝ่ายย่อย D"]
    },
    {
        dept_id: 2,
        dept_name: "แผนกซ่อมบำรุง",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B"]
    },
    {
        dept_id: 3,
        dept_name: "IT",
        sections: ["ฝ่ายย่อย A"]
    },
    {
        dept_id: 4,
        dept_name: "AB",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B", "ฝ่ายย่อย D"]
    },
    {
        dept_id: 5,
        dept_name: "CD",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B"]
    },
    {
        dept_id: 6,
        dept_name: "EF",
        sections: ["ฝ่ายย่อย A"]
    },
    {
        dept_id: 7,
        dept_name: "GH",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B"]
    }
    ,
    {
        dept_id: 8,
        dept_name: "IJ",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B", "ฝ่ายย่อย D"]
    },
    {
        dept_id: 9,
        dept_name: "KL",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B"]
    },
    {
        dept_id: 10,
        dept_name: "MN",
        sections: ["ฝ่ายย่อย A"]
    },
    {
        dept_id: 11,
        dept_name: "OP",
        sections: ["ฝ่ายย่อย A", "ฝ่ายย่อย B", "ฝ่ายย่อย D"]
    }
];

type Department = {
    dept_id: number;
    dept_name: string;
    sections: string[];
};

type Section = {
    sec_id: number,
    sec_name: string
}

const Departments = () => {
    //ตั้งข้อมูล department ไว้ใช้ใน filter
    const [departments, setDepartments] = useState<Department[]>(mockUpDepartment);

    const departmentOptions = [
        { id: "", label: "ทั้งหมด", value: "" },
        ...departments.map((d) => ({
            id: d.dept_id,
            label: d.dept_name,
            value: d.dept_name,
        })),
    ];

    const [departmentFilter, setDepartmentFilter] = useState<{ id: number | string; label: string; value: string } | null>(null);

    // เปิดดูรายการฝ่ายย่อย
    const [openDeptId, setOpenDeptId] = useState<number[]>([]);

    // ใช้เปิด/ปิด Dropdown แต่ละแผนก
    const toggleOpen = (id: number) => {
        // ถ้า id ของแผนกนั้นมีอยู่แล้ว filter ออก ถ้ายังไม่มีให้เพิ่มเข้าไปใน array
        setOpenDeptId((prev) => {
            return prev.includes(id) ? prev.filter((deptId) => deptId !== id) : [...prev, id];
        });
    };

    // ตั้งข้อมูล section ไว้ใช้ใน filter
    const [sections, setSections] = useState<Section[]>([]);

    const [sectionFilter, setSectionFilter] = useState<{ id: number | string; label: string; value: string } | null>(null);

    // เพิ่ม state สำหรับ modal
    const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

    // ดึงข้อมูล api จาก backend
    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get("/api/v1/departments-section");
            const data = res.data;

            setDepartments(data.departments || []);
            // setSections(data.sections || []);
        }
        fetchData();
    }, [])

    //Search Filter
    const [searchFilter, setSearchFilters] = useState({
        search: "",
    });

    // state เก็บฟิลด์ที่ใช้เรียง เช่น name
    const [sortField, setSortField] = useState<keyof Department | "statusText">();

    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const HandleSort = (field: keyof Department | "statusText") => {
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

        let result = departments.filter((dept) => {
            const bySearch = !search || dept.dept_name.toLowerCase().includes(search);

            const byDepartment = !departmentFilter?.value || dept.dept_name === departmentFilter.value;

            return bySearch && byDepartment;
        });

        //เริ่มทำการ sort
        result = [...result].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortField) {
                case "dept_name":
                    valA = a.dept_name;
                    valB = b.dept_name;
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
    }, [searchFilter, departmentFilter, sectionFilter, sortDirection]);

    //จัดการแบ่งแต่ละหน้า
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    useEffect(() => {
        setPage(1);
    }, [
        searchFilter,
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
                            <Button size="md" icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}>เพิ่มแผนก</Button>
                            <Button
                                variant="addSection"
                                size="md"
                                icon={<Icon icon="ic:baseline-plus" width="22" height="22" />}
                                onClick={() => setIsAddSectionOpen(true)} // เปิด modal
                            >
                                เพิ่มฝ่ายย่อย
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <div className="grid [grid-template-columns:150px_200px_740px_80px]
                                bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center gap-3">
                        <div className="py-2 px-4 text-left flex items-center"></div>
                        <div className="py-2 px-4 text-left flex items-center">
                            แผนก
                            <button type="button" onClick={() => HandleSort("dept_name")}>
                                <Icon
                                    icon={
                                        sortField === "dept_name"
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
                            จำนวนฝ่ายย่อย
                            <button type="button" onClick={() => HandleSort("dept_name")}>
                                <Icon
                                    icon={
                                        sortField === "dept_name"
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
                    {
                        pageRows.map((dep) => (
                            <div key={dep.dept_id}
                                className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-[16px] mt-[16px] mb-[16px] hover:bg-gray-50 overflow-hidden">
                                <div className="grid [grid-template-columns:150px_200px_740px_80px] mt-[30px] mb-[30px] items-center text-[16px] gap-3">
                                    {/* Dropdown Arrow */}
                                    <div className="py-2 px-4 flex justify-center items-center hover:cursor-pointer" onClick={() => toggleOpen(dep.dept_id)}>
                                        <DropdownArrow isOpen={openDeptId.includes(dep.dept_id)} />
                                    </div>
                                    {/* ชื่อแผนก */}
                                    <div className="py-2 px-4">
                                        {dep.dept_name}
                                    </div>
                                    {/* จำนวนฝ่ายย่อย */}
                                    <div className="py-2 px-4">
                                        <span className="bg-[#EBF3FE] rounded-[16px] w-[88px] h-[34px] inline-flex items-center justify-center">
                                            {dep.sections.length} ฝ่ายย่อย
                                        </span>
                                    </div>
                                    {/* จัดการ */}
                                    <div>
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
                                    </div>
                                </div>
                                {
                                    // ถ้า openDeptId เปิดอยู่ (แสดงฝ่ายย่อย)
                                    openDeptId.includes(dep.dept_id) && (
                                        <div className="flex flex-col gap-5 mt-[30px] mb-[30px]">
                                            <hr className="border-t border-gray-200 mx-[70px]" />
                                            {
                                                dep.sections.map((section, index) => (
                                                    <div key={index}
                                                        className="grid [grid-template-columns:150px_200px_740px_80px] h-[35px] items-center hover:bg-gray-50 text-[16px] gap-3">
                                                        {/* พื้นที่ว่าง */}
                                                        <div className="py-2 px-4"></div>
                                                        {/* ชื่อฝ่ายย่อย */}
                                                        <div className="py-2 px-4">
                                                            {section}
                                                        </div>
                                                        {/* พื้นที่ว่าง */}
                                                        <div className="py-2 px-4"></div>
                                                        {/* จัดการ */}
                                                        <div>
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
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
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

                {/* แทรก Popup modal */}
                <PopupAddSection isOpen={isAddSectionOpen} onClose={() => setIsAddSectionOpen(false)} />

            </div>
        </div>
    )
}

export default Departments