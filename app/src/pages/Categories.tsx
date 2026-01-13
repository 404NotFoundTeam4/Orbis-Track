import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Button from "../components/Button";
import SearchFilter from "../components/SearchFilter";
import { useToast } from "../components/Toast";
import { categoryService, type Category } from "../services/CategoryService";
import { AlertDialog } from "../components/AlertDialog";
import { CategoryModal } from "../components/CategoryModal";

export const Categories = () => {
  const toast = useToast();

  // ===== Query state (server-side) =====
  const [searchFilter, setSearchFilters] = useState({ search: "" });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8); // page limit

  const [includeDeleted] = useState(false);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ========== Data ==========
  const [rows, setRows] = useState<Category[]>([]);

  const [activeTotal, setActiveTotal] = useState(0);

  const [meta, setMeta] = useState({ page: 1, limit, total: 0, totalPages: 1 });

  const totalPages = Math.max(1, meta.totalPages);

  const [loading, setLoading] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ========= Delete Confirm =========
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ========= Add Category Modal =========
  const [modalOpen, setModalOpen] = useState(false);

  /**
   * Description: สลับการเรียงลำดับชื่อหมวดหมู่ (ca_name) ระหว่าง asc/desc
   *              และรีเซ็ตกลับไปหน้าแรกเพื่อให้ผลการเรียงถูกต้องตาม pagination
   * Input     : state เดิมของ sortOrder, page
   * Output    : อัปเดต sortOrder และ page (trigger ให้ดึงข้อมูลใหม่ตาม useEffect)
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  const handleSortName = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  /**
   * Description: ทำ Debounce คำค้นหา (search) เพื่อลดการยิง API ถี่เกินไป
   *              เมื่อผู้ใช้พิมพ์ค้นหา จะรอ 400ms หลังหยุดพิมพ์ก่อนอัปเดตค่า debouncedSearch
   *              และรีเซ็ตกลับไปหน้าแรกเพื่อให้ผลการค้นหาถูกต้องตาม pagination
   * Input     : searchFilter.search (ค่าคำค้นหาจาก SearchFilter)
   * Output    : อัปเดต debouncedSearch และ page (trigger ให้ useEffect ดึงข้อมูลใหม่)
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchFilter.search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchFilter.search]);

  /**
   * Description: ดึงข้อมูลหมวดหมู่อุปกรณ์จาก API ตามเงื่อนไขที่ผู้ใช้เลือก
   *              - รองรับค้นหา (q), แบ่งหน้า (page/limit), เรียงลำดับชื่อ (sortBy/sortOrder)
   *              - สามารถเลือกแสดงรายการที่ถูกลบ (includeDeleted)
   *              - เมื่อค่าเงื่อนไขเปลี่ยน หรือ refreshTrigger เปลี่ยน จะดึงข้อมูลใหม่
   * Input     : debouncedSearch, page, limit, includeDeleted, sortOrder, refreshTrigger
   * Output    : อัปเดต rows (รายการหมวดหมู่) และ meta (ข้อมูล pagination) พร้อมจัดการ loading/toast
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await categoryService.getCategories({
          q: debouncedSearch || undefined,
          page,
          limit,
          includeDeleted,
          sortBy: "ca_name",
          sortOrder,
        });

        setRows(result.data);
        setMeta(result.meta);
      } catch (err: any) {
        toast.push({
          message: err?.response?.data?.message || "โหลดหมวดหมู่ไม่สำเร็จ",
          tone: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [debouncedSearch, page, limit, includeDeleted, sortOrder, refreshTrigger]);

  /**
   * Description: ดึง “จำนวนหมวดหมู่ทั้งหมดที่ยังไม่ถูกลบ” (deleted_at = null) สำหรับแสดงใน Badge
   *              - ไม่ขึ้นกับการค้นหา (ไม่ส่ง q) เพื่อให้เป็นจำนวน “ทั้งหมดจริง”
   *              - ดึงเฉพาะ meta.total จึงใช้ limit=1 เพื่อลดภาระการโหลดข้อมูล
   *              - รีเฟรชจำนวนใหม่เมื่อมีการลบ/เพิ่มข้อมูล (refreshTrigger เปลี่ยน)
   * Input     : refreshTrigger
   * Output    : อัปเดต activeTotal (จำนวนหมวดหมู่ที่ยังไม่ถูกลบทั้งหมด)
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    const fetchActiveTotal = async () => {
      try {
        const result = await categoryService.getCategories({
          q: undefined, //ไม่ผูกกับ search เพื่อให้แสดงจำนวนตามจริง
          page: 1,
          limit: 1,
          includeDeleted: false, //นับเฉพาะรายการที่ยังไม่ถูกลบ

          sortBy: "ca_id",
          sortOrder: "asc",
        });

        setActiveTotal(result.meta.total);
      } catch (err) {
        //ถ้าโหลดจำนวนรวมไม่สำเร็จ ให้ fallback เป็น 0 กันพัง
        setActiveTotal(0);
      }
    };

    fetchActiveTotal();
  }, [refreshTrigger]);

  // ควบคุมการเปิดปิด Modal ตอนแก้ไขหมวดหมู่
  const [isEditCategory, setIsEditCategory] = useState<boolean>(false);
  // หมวดหมู่ที่แก้ไข
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col p-[16px]">
      <div className="flex-1 overflow-hidden ">
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">หมวดหมู่อุปกรณ์</span>
        </div>
        {/* ช่องค้นหา */}
        <div className="w-[420px] max-w-full">
          <SearchFilter onChange={setSearchFilters} />
        </div>

        {/* Button -เพิ่มหมวดหมู่ */}
        <div className="flex items-center gap-2">
          <Button
            size="md"
            icon={<Icon icon="ic:baseline-plus" width="20px" height="20px" />}
            onClick={() => setModalOpen(true)}
            className="w-[150px] h-[46px] text-[16px] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            เพิ่มหมวดหมู่
          </Button>

          {/* Title จัดการหมวดหมู่*/}
          <div className="flex items-center gap-[14px] mb-[21px] h-[34px]">
            <h1 className="text-[24px] font-semibold">จัดการหมวดหมู่อุปกรณ์</h1>
            <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
              หมวดหมู่ทั้งหมด {activeTotal}
            </div>
          </div>

          <div className="w-full mb-[16px]">
            <div className="flex flex-wrap justify-between items-center gap-3">
              {/* ช่องค้นหา */}
              <div className="w-[420px] max-w-full">
                <SearchFilter onChange={setSearchFilters} />
              </div>

              {/* Button -เพิ่มหมวดหมู่ */}
              <div className="flex items-center gap-2">
                <Button
                  size="md"
                  icon={
                    <Icon icon="ic:baseline-plus" width="20px" height="20px" />
                  }
                  onClick={() =>
                    toast.push({
                      message: "ยังไม่ทำ Add Category",
                      tone: "warning",
                    })
                  }
                  className="w-[150px] h-[46px] text-[16px] font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  เพิ่มหมวดหมู่
                </Button>
              </div>
            </div>
          </div>

          {/* Table หมวดหมู่*/}
          <div className=" bg-[#FFFFFF] mb-[16px]">
            {/* Header row (หมวดหมู่ , จัดการ) */}
            <div className="flex items-center justify-between px-[16px]  h-[61px] border border-[#D9D9D9] rounded-[16px] ">
              <div className="flex items-center gap-2 font-semibold">
                <span>หมวดหมู่</span>
                <button type="button" onClick={handleSortName}>
                  <Icon
                    icon={sortOrder === "asc" ? "bx:sort-down" : "bx:sort-up"}
                    width="20"
                    height="20"
                  />
                </button>
              </div>
              <div className="font-semibold w-[81px]">จัดการ</div>
            </div>
          </div>

          <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-[16px] ">
            {/* Row */}
            <div className="px-[16px] py-[10px] h-[520px] overflow-y-auto ">
              {loading ? (
                <div className="py-6 text-[#858585]">กำลังโหลด...</div>
              ) : rows.length === 0 ? (
                <div className="py-6 text-[#858585]">ไม่พบข้อมูล</div>
              ) : (
                rows.map((c) => (
                  <div
                    key={c.ca_id}
                    className="flex items-center justify-between h-[62px]  border-[#F3F3F3] last:border-b-0"
                  >
                    <div className="text-[16px]">{c.ca_name}</div>

                    <div className="flex items-center gap-[10px]">
                      {/* edit */}
                      <button
                        type="button"
                        onClick={() => {
                          (setIsEditCategory(true), setEditingCategory(c));
                        }}
                        className="group w-[40px] h-[40px] flex items-center justify-center rounded-[12px]
                                            text-[#1890FF] transition-colors duration-150
                                            hover:bg-[#40A9FF] hover:text-white"
                        title="แก้ไข"
                      >
                        <Icon
                          icon="prime:pen-to-square"
                          width="22"
                          height="22"
                        />
                      </button>

                      {/* delete */}
                      {!c.deleted_at && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          title="ลบ"
                          className="group w-[40px] h-[40px] flex items-center justify-center rounded-[12px]
                                                text-[#FF4D4F] transition-colors duration-150
                                                hover:bg-[#FF7875] hover:text-white"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-outline"
                            width="22"
                            height="22"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* ถ้ากำลังแก้ไขให้แสดง category modal */}
            {isEditCategory && (
              <CategoryModal
                open={isEditCategory}
                mode="edit-category"
                initialCategory={editingCategory}
                onOpenChange={() => setIsEditCategory(false)}
                onSuccess={() => setRefreshTrigger((p) => p + 1)}
              />
            )}

            {/* Pagination  */}
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
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          tone="danger"
          title="ยืนยันการลบหมวดหมู่"
          description={
            deleteTarget ? (
              <>
                ต้องการลบหมวดหมู่{" "}
                <span className="font-semibold">{deleteTarget.ca_name}</span>{" "}
                ใช่หรือไม่
              </>
            ) : null
          }
          confirmText="ลบ"
          cancelText="ยกเลิก"
          onConfirm={async () => {
            if (!deleteTarget) return;
            await categoryService.deleteCategory(deleteTarget.ca_id);
            toast.push({ message: "ลบหมวดหมู่สำเร็จ", tone: "confirm" });
            setRefreshTrigger((p) => p + 1);
          }}
        />
      </div>
      ){/* Pagination  */}
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
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        tone="danger"
        title="ยืนยันการลบหมวดหมู่"
        description={
          deleteTarget ? (
            <>
              ต้องการลบหมวดหมู่{" "}
              <span className="font-semibold">{deleteTarget.ca_name}</span>{" "}
              ใช่หรือไม่
            </>
          ) : null
        }
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await categoryService.deleteCategory(deleteTarget.ca_id);
          toast.push({ message: "ลบหมวดหมู่สำเร็จ", tone: "confirm" });
          setRefreshTrigger((p) => p + 1);
        }}
      />
      {/**
       * Description: แสดง Modal สำหรับเพิ่มหมวดหมู่อุปกรณ์ (Category)
       *              - เปิด Modal เมื่อ modalOpen = true
       *              - ใช้โหมด add-category เพื่อเพิ่มหมวดหมู่ใหม่
       *              - เมื่อเพิ่มสำเร็จ จะรีเฟรชข้อมูลตารางหมวดหมู่
       * Input     :  - modalOpen            : สถานะการเปิด/ปิด Modal
       *              - onOpenChange         : ฟังก์ชันควบคุมการเปิด/ปิด Modal
       *              - onSuccess            : Callback หลังเพิ่มหมวดหมู่สำเร็จ
       * Output    :  รีเฟรชข้อมูลหมวดหมู่ใหม่ผ่าน refreshTrigger
       * Author    :  Rachata Jitjeankhan (Tang) 66160369
       */}
      <CategoryModal
        open={modalOpen}
        mode="add-category"
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setRefreshTrigger((p) => p + 1);
        }}
      />
    </div>
  );
};
