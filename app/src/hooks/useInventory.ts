import { DeviceService } from "../services/InventoryService";
import type{ getAllDevices, createDevices,createApprove} from "../services/InventoryService";

export async function getDevicesAll(): Promise<getAllDevices> {
  const res = await DeviceService.getAllDevices();
  return res;
}

export async function createDevicesdata(payload: createDevices) {
  const res = await DeviceService.createDevices(payload);
  return res;
}

export async function createApprovedata(payload: createApprove) {
  const res = await DeviceService.createApprove(payload);
  return res;
}

export async function getApproveAll() {
  const res = await DeviceService.getApprove();
  return res;
}

export const useInventorys = {
  getDevicesAll,createDevicesdata,createApprovedata,getApproveAll
};
