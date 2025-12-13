import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"

interface BreadcrumbItem {
    label: string; // ชื่อที่แสดง
    href?: string; // เส้นทางที่จะให้ไป (optional หน้าปัจจุบันไม่ต้องระบุ)
}

// โครงสร้างข้อมูลที่ต้องส่งมาเมื่อเรียกใช้งาน
interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <div className="flex items-center gap-[9px] text-[18px]">
            {
                // วนลูปแสดงรายการ
                items.map((item, index) => (
                    <div key={index} className="flex items-center gap-[9px]">
                        {
                            // ไม่ใช่ตัวสุดท้ายให้เป็น link
                            index !== items.length - 1 && item.href
                                ? (
                                    <Link
                                        className="text-[#858585] hover:text-[#40A9FF]"
                                        to={item.href}
                                    >
                                        {item.label}
                                    </Link >
                                )
                            // ตัวสุดท้ายให้เป็นข้อความ
                                : (
                                    <span className="text-[#000000]">
                                        {item.label}
                                    </span>
                                )
                        }
                        {
                            index !== items.length - 1 && (
                                <Icon
                                    className="text-[#858585]"
                                    icon="hugeicons:greater-than"
                                    width={21}
                                    height={21}
                                />
                            )
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default Breadcrumb