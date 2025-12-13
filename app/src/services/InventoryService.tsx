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

    getInventory: async (): Promise<
        GetInventory[]
    > => {
        const { data } = await api.get(`/inventory/devices`);
        return data.data;
    }

}