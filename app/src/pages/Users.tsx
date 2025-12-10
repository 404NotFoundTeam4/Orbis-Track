import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import { Icon } from "@iconify/react";
import api from "../api/axios.js";
import UserModal from "../components/UserModal";
import { useToast } from "../components/Toast";
import getImageUrl from "../services/GetImage.js";
import { getAccount } from "../hooks/useAccount.js"
type User = {
  us_id: number;
  us_emp_code: string;
  us_firstname: string;
  us_lastname: string;
  us_username: string;
  us_email: string;
  us_phone: string;
  us_images: string | null;
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
type NewUserPayload = Partial<User> & {
  us_password?: string;
};

type Department = {
  dept_id: number;
  dept_name: string;
};

/**
 * Description: แปลงเบอร์โทร 10 หลัก (0812345678) เป็น 081-234-5678
 * Input : phone: string | null
 * Output : "081-234-5678" หรือ "-"
 * Author : Pakkapon Chomchoey 66160080
 */
const FormatPhone = (phone: string | null | undefined): string => {
  if (!phone) {
    return "-"; // ถ้าไม่มีเบอร์
  }
  
  // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก (เผื่อมีขีดกลางอยู่แล้ว)
  const digits = phone.replace(/\D/g, "");

  // ถ้าเป็นเบอร์มือถือ 10 หลัก
  if (digits.length === 10) {
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
  }

  // ถ้าเป็นเบอร์บ้าน 9 หลัก (เช่น 02)
  if (digits.length === 9) {
    return `${digits.substring(0, 2)}-${digits.substring(2, 5)}-${digits.substring(5)}`;
  }

  // ถ้าไม่ใช่ 9 หรือ 10 หลัก ให้คืนค่าเดิม
  return phone;
};

/**
 * Description: คอมโพเนนต์หลักจัดการผู้ใช้งาน
 * - ดึงข้อมูลผู้ใช้จาก API
 * - มีฟังก์ชัน filter, search, sort, pagination
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
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

  const roleTranslation: { [key: string]: string } = {
    ADMIN: "ผู้ดูแลระบบ",
    HOD: "หัวหน้าแผนก",
    HOS: "หัวหน้าฝ่ายย่อย",
    TECHNICAL: "ช่างเทคนิค",
    STAFF: "เจ้าหน้าที่คลัง",
    EMPLOYEE: "พนักงานทั่วไป",
  };

  const [users, setusers] = useState<User[]>([]);
  //ตั้งข้อมูล role ไว้ใช้ใน filter
  const roleOptions = [
    { id: "", label: "ประเภทตำแหน่ง", value: "" },
    ...Array.from(
      new Set(users.map((u) => u.us_role)) // ตัดซ้ำ
    ).map((r, index) => ({
      id: index + 1,
      label: roleTranslation[r] || r,
      value: r,
    })),
  ];
  const [roleFilter, setRoleFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);

  //Search Filter
  const [searchFilter, setSearchFilters] = useState({
    search: "",
  });

  // เพิ่ม State สำหรับ Modal และการ Refresh
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete">("add");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useToast();
  // สร้างฟังก์ชันสำหรับจัดการ Modal
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setModalType("add");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleSaveUser = async (updatedData: Partial<User>) => {
    if (!updatedData.us_id) {
      console.error("Cannot save user: missing us_id for update");
      return;
    }

    try {
      const formData = new FormData();

      (Object.keys(updatedData) as (keyof User)[]).forEach((key) => {
        const value = updatedData[key];

        if (value !== undefined && value !== null) {
          if (key === "us_images") {
            if (value instanceof File) {
              formData.append(key, value);
            }
            return;
          }

          // key อื่นๆ (ชื่อ, นามสกุล) ส่งปกติ
          formData.append(key, value as any);
        }
      });
      //ส่ง Request (PATCH)
      const res = await api.patch(`/accounts/${updatedData.us_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        toast.push({ message: "แก้ไขบัญชีผู้ใช้เสร็จสิ้น!", tone: "confirm" });
        
       
        // อัปเดต State ให้รูปเปลี่ยนทันทีโดยไม่ต้องรีเฟรช
        setusers((prevUsers) => {
          return prevUsers.map((user) => {
            if (user.us_id === updatedData.us_id) {
              const mergedUser = { ...user, ...updatedData };

              // Logic โชว์รูป Preview ทันที
              let newImage = user.us_images;
              if (updatedData.us_images instanceof File) {
                newImage = URL.createObjectURL(updatedData.us_images);
              }

              return {
                ...mergedUser,
                // ... update logic อื่นๆ ...
                us_dept_name:
                  departments.find((d) => d.dept_id === mergedUser.us_dept_id)
                    ?.dept_name || user.us_dept_name,
                us_sec_name:
                  sections.find((s) => s.sec_id === mergedUser.us_sec_id)
                    ?.sec_name ||
                  (mergedUser.us_sec_id ? user.us_sec_name : "-"),
                us_images: newImage,
              };
            }
            return user;
          });
        });
         getAccount()
      } else {
        toast.push({ message: "เกิดข้อผิดพลาด", tone: "danger" });
      }
    } catch (err: any) {
      console.error("❌ Error (catch):", err);

      if (err.response?.data?.success) {
        toast.push({ message: "แก้ไขบัญชีผู้ใช้เสร็จสิ้น!", tone: "confirm" });
      }
      const apiErrorMessage =
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดที่ไม่รู้จัก";

      toast.push({
        message: `บันทึกไม่สำเร็จ: ${apiErrorMessage}`,
        tone: "danger",
      });
    } finally {
      // 3. ปิด Modal เสมอ ไม่ว่า API จะสำเร็จหรือล้มเหลว
      handleCloseModal();
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // ฟังก์ชันเพิ่มผู้ใช้ใหม่
  const handleAddUser = async (newUserData: NewUserPayload) => {
    console.log(newUserData);

    try {
      const formData = new FormData();

      (Object.keys(newUserData) as (keyof NewUserPayload)[]).forEach((key) => {
        const value = newUserData[key];
        // เช็คว่ามีค่าไหม ถ้ามีให้ยัดลงไป
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const response = await api.post(`/accounts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setusers((prevUsers) => {
        const newUser = {
          ...newUserData,
          us_id: response.data.data?.us_id || response.data.id || Date.now(),
          us_dept_name:
            departments.find((d) => d.dept_id === newUserData.us_dept_id)
              ?.dept_name || "",
          us_sec_name:
            sections.find((s) => s.sec_id === newUserData.us_sec_id)
              ?.sec_name || "-",
          created_at: new Date(),
          us_is_active: true,
          // ถ้าเป็นไฟล์ ให้สร้าง URL หลอกๆ มาโชว์ก่อนรีเฟรช
          us_images:
            newUserData.us_images instanceof File
              ? URL.createObjectURL(newUserData.us_images)
              : null,
        } as User;

        return [...prevUsers, newUser];
      });
      // แสดงข้อความสำเร็จ

      toast.push({
        message: "เพิ่มบัญชีผู้ใช้สำเร็จ!",
        tone: "confirm",
      });
    } catch {
      // จัดการข้อผิดพลาด
      toast.push({
        message: "เกิดข้อผิดพลาด ไม่สามารถเพิ่มบัญชีผู้ใช้ได้",
        tone: "danger",
      });
    } finally {
      // ปิด Modal
      handleCloseModal();
    }
  };

  // ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async (userData: Partial<User>) => {
    try {
      if (!userData.us_id) {
        console.error("Cannot delete user: missing us_id");
        return;
      }

      // เรียก API DELETE เพื่อลบผู้ใช้
      await api.delete(`/accounts/${userData.us_id}`);
      console.log(`User ID ${userData.us_id} deleted successfully`);

      // อัปเดต State 'users' ใน Frontend (แสดงผลทันที)
      setusers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.us_id === userData.us_id) {
            return {
              ...user,
              us_is_active: false, // ตั้งค่าเป็นไม่ใช้งาน
            };
          }
          return user;
        });
      });
    } catch (error) {
      // จัดการข้อผิดพลาด
      console.error("Error deleting user via API:", error);
      alert("ไม่สามารถลบบัญชีผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      // ปิด Modal
      handleCloseModal();
    }
  };

  const handleModalSubmit = () => {
    handleCloseModal();
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * Description: ดึงข้อมูลผู้ใช้/แผนก/ฝ่ายย่อยจาก API
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/accounts");
        const data = res.data;

        setSections(data.data.sections || []);
        setDepartments(data.data.departments || []);
        setusers(data.data.accountsWithDetails || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [refreshTrigger]);

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
    return `${day} / ${month} / ${year}`;
  };

  // state เก็บฟิลด์ที่ใช้เรียง เช่น name
  const [sortField, setSortField] = useState<keyof User | "statusText">(
    "created_at"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /**
   * Description: เปลี่ยน field ที่ต้องการจะเรียง หรือ เปลี่ยนลักษณะการเรียง
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

  /**
   * Description: กรองและ sort users ตาม search/filter/sort
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const filtered = useMemo(() => {
    const search = searchFilter.search.trim().toLowerCase();
    let result = users.filter((u) => {
      const bySearch =
        !search ||
        [
          u.us_firstname,
          u.us_lastname,
          u.us_emp_code,
          roleTranslation[u.us_role] || "",
          u.us_email,
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
          valA = roleTranslation[a.us_role];
          valB = roleTranslation[b.us_role];
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
    sortField,
    sortDirection,
  ]);

  //จัดการแบ่งแต่ละหน้า
  const [page, setPage] = useState(1);
  const pageSize = 10; // 10/20/50 ก็ได้

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [
    searchFilter,
    roleFilter,
    departmentFilter,
    sectionFilter,
    // sortDirection,
  ]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const getSortIcon = (
    currentField: string,
    targetField: string,
    direction: "asc" | "desc"
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
    <div className="w-full min-h-screen flex flex-col p-4">
      <div className="flex-1">
        {/* แถบนำทาง */}
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">บัญชีผู้ใช้</span>
        </div>

        {/* ชื่อหน้า */}
        <div className="flex items-center gap-[14px] mb-[21px]   ">
          <h1 className="text-2xl font-semibold">จัดการบัญชีผู้ใช้</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            ผู้ใช้งานทั้งหมด {users.filter((u) => u.us_is_active).length}
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
              <Button
                size="md"
                icon={
                  <Icon icon="ic:baseline-plus" width="20px" height="20px" />
                }
                onClick={handleOpenAddModal}
                className="w-[150px] h-[46px] text-[16px] font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                เพิ่มบัญชีผู้ใช้
              </Button>
            </div>
          </div>
        </div>

        {/* ตาราง */}
        <div className="w-full overflow-x-auto">
          {/* หัวตาราง */}
          <div
            className="grid grid-cols-[minmax(300px,2fr)_repeat(6,minmax(120px,1fr))_auto]
                      bg-white border border-[#D9D9D9] font-semibold text-gray-700 
                      rounded-[16px] mb-[16px] h-[61px] items-center gap-3"
          >
            <div className="py-2 px-4 text-left flex items-center">
              ชื่อผู้ใช้
              <button type="button" onClick={() => HandleSort("us_firstname")}>
                <Icon
                  icon={getSortIcon(sortField, "us_firstname", sortDirection)}
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
                  icon={getSortIcon(sortField, "us_role", sortDirection)}
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
                  icon={getSortIcon(sortField, "us_dept_name", sortDirection)}
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
                  icon={getSortIcon(sortField, "us_sec_name", sortDirection)}
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
                  icon={getSortIcon(sortField, "created_at", sortDirection)}
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
                  icon={getSortIcon(sortField, "us_is_active", sortDirection)}
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center w-[150px]">
              จัดการ
            </div>
          </div>

          <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-[16px] min-h-[679px] flex flex-col">
            {/* แถวข้อมูล */}
            {pageRows.map((u) => (
              <div
                key={u.us_id}
                className="grid grid-cols-[minmax(300px,2fr)_repeat(6,minmax(120px,1fr))_auto]
                          items-center gap-3 hover:bg-gray-50 py-2"
              >
                {/* ชื่อผู้ใช้ */}
                <div className="py-2 px-4 flex items-center">
                  {u.us_images ? (
                    <img
                      src={getImageUrl(u.us_images)}
                      alt={u.us_firstname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <Icon icon="ph:user" width="24" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div>{`${u.us_firstname} ${u.us_lastname}`}</div>
                    <div>
                      <span className="text-blue-600">{u.us_email} : </span>
                      <span>{u.us_emp_code}</span>
                    </div>
                  </div>
                </div>

                <div className="py-2 px-4">
                  {roleTranslation[u.us_role] || u.us_role}
                </div>
                <div className="py-2 px-4">{u.us_dept_name ?? "-"}</div>
                <div className="py-2 px-4">{u.us_sec_name ?? "-"}</div>
                <div className="py-2 px-4">
                  {FormatPhone(u.us_phone) ?? "-"}
                </div>
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

                <div className="py-2 px-4 flex items-center gap-3 w-[150px]">
                  {u.us_is_active && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="w-[34px] h-[34px] flex items-center justify-center 
                          text-[#1890FF] hover:bg-[#40A9FF] hover:text-[#FFFFFF]
                          rounded-[8px] cursor-pointer transition-all duration-150"
                        title="แก้ไข"
                      >
                        <Icon
                          icon="prime:pen-to-square"
                          width="22"
                          height="22"
                        />
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(u)}
                        className="w-[34px] h-[34px] flex items-center justify-center 
                          text-[#FF4D4F] hover:bg-[#FF7875] hover:text-[#FFFFFF]
                          rounded-[8px] cursor-pointer transition-all duration-150"
                        title="ลบ"
                      >
                        <Icon
                          icon="solar:trash-bin-trash-outline"
                          width="22"
                          height="22"
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* ปุ่มหน้า */}
            <div className="mt-auto mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
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

      {isModalOpen && (
        <UserModal
          typeform={modalType}
          user={selectedUser}
          onClose={handleCloseModal}
          onSubmit={
            modalType === "edit"
              ? handleSaveUser
              : modalType === "add"
                ? handleAddUser
                : modalType === "delete"
                  ? handleDeleteUser
                  : handleModalSubmit
          }
          keyvalue="all"
          departmentsList={departments}
          sectionsList={sections}
          rolesList={roleOptions}
          allUsers={users}
        />
      )}
    </div>
  );
};
