import api from "../api/axios";

export interface GetInventory {
    de_id: number;
    de_serial_number: string;
    de_name: string;
    de_description: string;
    de_location: string;
    de_max_borrow_days: number;
    de_images: string | null;
    category: string;
    department: string | null;
    sub_section: string | null;
    total: number;
    available: number;
}

export const inventoryService = {

   /**
   * Description: ดึงข้อมูลอุปกรณ์
   * Input     : -
   * Output    : Promise<GetInventory> - ข้อมูลอุปกรณ์
   * Endpoint  : GET /api/inventory/devices
   * Author    : Sutaphat Thahin (Yeen) 66160378
   */
    getInventory: async (): Promise<
        GetInventory[]
    > => {
        const { data } = await api.get(`/inventory/devices`);
        return data.data;
    }
}