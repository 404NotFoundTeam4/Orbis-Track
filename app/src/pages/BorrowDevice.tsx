// src/pages/BorrowDevicePage.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { inventoryService } from '../services/InventoryService';
import BorrowDeviceModal from '../components/BorrowDeviceModal';

interface BorrowState {
  deviceID: string;
  deviceName: string;
}

interface EquipmentDetailForModal {
  id: number;
  name: string;
  total: number;
  remain: number;
  maxBorrowDays: number;
  category: string;
  department: string;
  section: string;
  storageLocation: string;
  accessories: { name: string; qty: number }[];
  imageUrl?: string;
}

const BorrowDevice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BorrowState;

  if (!state?.deviceID || !state?.deviceName) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">เกิดข้อผิดพลาด</h2>
        <p>
          ไม่พบข้อมูลอุปกรณ์ โปรดกลับไปเลือกอุปกรณ์จาก{' '}
          <span
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate('/list-devices')}
          >
            รายการอุปกรณ์
          </span>
        </p>
        <Button onClick={() => navigate('/list-devices')} className="mt-4">
          กลับไปหน้ารายการ
        </Button>
      </div>
    );
  }

  const { deviceID, deviceName } = state;

  // -------------------- FORM STATE --------------------
  const [borrowDetails, setBorrowDetails] = useState({
    borrower: '',
    phone: '',
    reason: '',
    placeOfUse: '',
    quantity: 1,
    borrowDate: null as Date | null,
    returnDate: null as Date | null,
    borrowTime: '',
    returnTime: '',
  });

  // -------------------- EQUIPMENT STATE --------------------
  const [equipment, setEquipment] = useState<EquipmentDetailForModal | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------- FETCH FROM DATABASE --------------------
 useEffect(() => {
  const fetchEquipment = async () => {
    try {
      const res = await inventoryService.getInventoryById(
        Number(deviceID)
      );

      if (!res) throw new Error("ไม่พบอุปกรณ์");

      setEquipment({
        id: res.de_id,
        name: res.de_name,
        total: res.total,
        remain: res.available,
        maxBorrowDays: res.de_max_borrow_days,
        category: res.category,
        department: res.department ?? "-",
        section: res.sub_section ?? "-",
        storageLocation: res.de_location,
        accessories: [],
        imageUrl: res.de_images ?? undefined,
      });
    } catch (error) {
      console.error("โหลดข้อมูลอุปกรณ์ล้มเหลว", error);
    } finally {
      setLoading(false);
    }
  };

  fetchEquipment();
}, [deviceID]);


  if (loading) {
    return <div className="p-8">กำลังโหลดข้อมูลอุปกรณ์...</div>;
  }

  if (!equipment) {
    return <div className="p-8 text-red-500">ไม่พบข้อมูลอุปกรณ์</div>;
  }

  // -------------------- SUBMIT --------------------
  const handleSubmit = async (data: { equipmentId: number; data: any }) => {
    const payload = {
      ...data.data,
      de_id: data.equipmentId,
      borrowDate: data.data.borrowDate?.toISOString() ?? null,
      returnDate: data.data.returnDate?.toISOString() ?? null,
    };

    try {
      // await inventoryService.borrowDevice(payload);
      console.log('ยืมอุปกรณ์:', payload);
      alert(`ยืม "${deviceName}" จำนวน ${data.data.quantity} ชิ้น สำเร็จ`);
      navigate('/list-devices');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการยืม', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const handleAddToCart = (data: { equipmentId: number; data: any }) => {
    console.log('เพิ่มเข้าตะกร้า:', data);
    alert(`เพิ่ม "${deviceName}" เข้าตะกร้าแล้ว`);
  };

  // -------------------- UI --------------------
  return (
    <div className="w-full min-h-screen flex p-4">
      <div className="flex-1">
        <div className="mb-6 text-sm space-x-2">
          <span className="text-gray-400">รายการอุปกรณ์</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-black">ยืมอุปกรณ์</span>
        </div>

        <h1 className="text-2xl font-semibold mb-4">ยืมอุปกรณ์</h1>

        <BorrowDeviceModal
          mode="borrow-equipment"
          equipment={equipment}
          defaultValue={borrowDetails}
          onSubmit={handleSubmit}
          onAddToCart={handleAddToCart}
        />

      </div>
    </div>
  );
};

export default BorrowDevice;
