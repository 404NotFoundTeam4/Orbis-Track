import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function AddUserModal() {
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState<string | null>(null);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-[24px] p-8 w-[804px] max-w-[95%] max-h-[95vh] shadow-2xl relative border flex flex-col overflow-visible">
                {/* Close button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl w-8 h-8 rounded-full flex items-center justify-center border"
                    aria-label="close"
                >
                    ×
                </button>

                {/* Title */}
                <h2
                    className="text-center mb-6"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: '32px', fontWeight: 700 }}
                >
                    เพิ่มบัญชีผู้ใช้
                </h2>

                {/* Avatar upload */}
                <div className="flex flex-col items-center mb-6 flex-shrink-0">
                    <div className="w-28 h-28 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                        {avatar ? (
                            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-300 text-3xl">
                                <Icon icon="ion:image-outline" width="37.19" height="20" />
                            </div>
                        )}
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-gray-600 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    const url = URL.createObjectURL(f);
                                    setAvatar(url);
                                }
                            }}
                        />
                        <span className="text-base">+ เพิ่มรูปภาพ</span>
                    </label>
                </div>

                {/* เนื้อหา form (ไม่เลื่อนภายใน: แสดงทั้งหมดใน popup เดียว) */}
                <div className="pr-2">
                    <form className="space-y-8 text-sm">
                        {/* โปรไฟล์ */}
                        <div>
                            <h3 className="text-gray-700 font-medium">โปรไฟล์</h3>
                            <div className="text-sm text-gray-400 mb-3">รายละเอียดโปรไฟล์ผู้ใช้</div>

                            <div className="grid grid-cols-3 gap-x-0 gap-y-4">
                                <div>
                                    <label className="block text-gray-600 mb-1">ชื่อ</label>
                                    <input placeholder="ชื่อจริงของผู้ใช้งาน" className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 placeholder-gray-300" />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">นามสกุล</label>
                                    <input placeholder="นามสกุลของผู้ใช้งาน" className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 placeholder-gray-300" />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">รหัสพนักงาน</label>
                                    <input placeholder="รหัสพนักงานของผู้ใช้งาน" className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 placeholder-gray-300" />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">อีเมล</label>
                                    <input placeholder="อีเมลของผู้ใช้งาน" className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 placeholder-gray-300" />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                                    <input placeholder="เบอร์โทรศัพท์ของผู้ใช้งาน" className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 placeholder-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* ตำแหน่งงาน */}
                        <div>
                            <h3 className="text-gray-700 font-medium">ตำแหน่งงาน</h3>
                            <div className="text-sm text-gray-400 mb-3">รายละเอียดตำแหน่งงานของผู้ใช้</div>

                            <div className="grid grid-cols-3 gap-x-0 gap-y-4">
                                <div>
                                    <label className="block text-gray-600 mb-1">ตำแหน่ง</label>
                                    <select className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700"><option>ประเภทตำแหน่ง</option></select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">แผนก</label>
                                    <select className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700"><option>ประเภทแผนก</option></select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1">ฝ่ายย่อย</label>
                                    <select className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700"><option>ประเภทฝ่ายย่อย</option></select>
                                </div>
                            </div>
                        </div>

                        {/* บัญชี */}
                        <div>
                            <h3 className="text-gray-700 font-medium">บัญชี</h3>
                            <div className="text-sm text-gray-400 mb-3">รายละเอียดบัญชีของผู้ใช้</div>

                            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                                <div className="col-span-3">
                                    <label className="block text-gray-600 mb-1">ชื่อผู้ใช้ (ล็อกอิน)</label>
                                    <div className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm text-gray-700 flex items-center gap-2">
                                        <span className="text-gray-500">👤</span>
                                        <input placeholder="ชื่อผู้ใช้" className="flex-1 border-0 outline-none text-sm text-gray-700 placeholder-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ปุ่มบันทึก */}
                        <div className="flex justify-center mt-4">
                            <button type="button" className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-full shadow">บันทึก</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}