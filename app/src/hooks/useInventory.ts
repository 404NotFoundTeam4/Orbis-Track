import { DeviceService } from "../services/InventoryService";
import type { getAllDevices } from "../services/InventoryService";

export async function getDevicesAll(): Promise<getAllDevices> {
  const res = await DeviceService.getAllDevices();
  return res;
}

export const useInventorys = {
  getDevicesAll,
};
