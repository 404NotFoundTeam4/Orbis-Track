/**
 * Description: Service สำหรับดึง dropdown options จาก API (เช่น status, repair status)
 * - ดึงค่าที่ควร centralize ไว้ฝั่ง server แทนที่จะ hardcode ฝั่ง client
 * Input : -
 * Output : dropdown options ต่างๆ
 * Author: 66160080 Pakkapon Chomchoey (Tonnam)
 */
import api from "../api/axios";

export interface DropdownOption {
    id: string;
    value: string;
    label: string;
}

export interface DropdownOptions {
    borrowStatuses: DropdownOption[];
    borrowStatusesStaff: DropdownOption[];
    borrowStatusesApprover: DropdownOption[];
    repairStatuses: DropdownOption[];
}

/**
 * Description: ดึง dropdown options ทั้งหมดจาก API
 * Input     : -
 * Output    : Promise<DropdownOptions>
 * Endpoint  : GET /home/meta/options
 */
async function getDropdownOptions(): Promise<DropdownOptions> {
    const { data } = await api.get("/home/meta/options");
    return data.data;
}

export const metaService = {
    getDropdownOptions,
};
