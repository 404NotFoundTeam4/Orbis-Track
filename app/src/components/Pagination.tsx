/**
 * Description: Pagination component สำหรับแบ่งหน้าข้อมูล
 * - แสดงปุ่มก่อนหน้า/ถัดไป
 * - แสดงหน้าแรก, หน้าปัจจุบัน, หน้าสุดท้าย พร้อม ellipsis
 * - มีช่องใส่เลขหน้าเพื่อข้ามไปหน้าที่ต้องการ
 * Input : PaginationProps { currentPage, totalPages, onPageChange, className? }
 * Output : React Component หรือ null (ถ้ามีแค่ 1 หน้า)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */

interface PaginationProps {
    /** หน้าปัจจุบัน (1-indexed) */
    currentPage: number;
    /** จำนวนหน้าทั้งหมด */
    totalPages: number;
    /** Callback เมื่อเปลี่ยนหน้า */
    onPageChange: (page: number) => void;
    /** ClassName เพิ่มเติมสำหรับ container */
    className?: string;
}

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}: PaginationProps) => {
    // ถ้ามีแค่ 1 หน้าหรือน้อยกว่า ไม่ต้องแสดง pagination
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleGoTo = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const value = Number(fd.get("goto"));
            if (!Number.isNaN(value)) {
                onPageChange(Math.min(totalPages, Math.max(1, value)));
            }
        }
    };

    return (
        <div
            className={`mt-auto mb-[24px] pt-3 mr-[24px] flex items-center justify-end ${className}`}
        >
            <div className="flex items-center gap-2">
                {/* ปุ่มก่อนหน้า */}
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                >
                    {"<"}
                </button>

                {/* หน้า 1 */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${currentPage === 1
                        ? "border-[#000000] text-[#000000]"
                        : "border-[#D9D9D9]"
                        }`}
                >
                    1
                </button>

                {/* หน้าปัจจุบันถ้าไม่ใช่ 1 และไม่ใช่หน้าสุดท้าย แสดงด้วยกรอบดำ */}
                {currentPage > 2 && <span className="px-1 text-gray-400">…</span>}
                {currentPage > 1 && currentPage < totalPages && (
                    <button
                        type="button"
                        className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
                    >
                        {currentPage}
                    </button>
                )}
                {currentPage < totalPages - 1 && (
                    <span className="px-1 text-gray-400">…</span>
                )}

                {/* หน้าสุดท้าย (ถ้ามากกว่า 1) */}
                {totalPages > 1 && (
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        className={`h-8 min-w-8 px-2 rounded border text-sm ${currentPage === totalPages
                            ? "border-[#000000] text-[#000000]"
                            : "border-[#D9D9D9]"
                            }`}
                    >
                        {totalPages}
                    </button>
                )}

                {/* ถัดไป */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                >
                    {">"}
                </button>

                {/* ไปหน้าที่ */}
                <form onKeyDown={handleGoTo} className="flex items-center gap-1">
                    <span>ไปที่หน้า</span>
                    <input
                        name="goto"
                        type="number"
                        min={1}
                        max={Number.isNaN(totalPages) ? undefined : totalPages}
                        className="h-8 w-14 rounded border border-[#D9D9D9] px-2 text-sm"
                    />
                </form>
            </div>
        </div>
    );
};

export default Pagination;
