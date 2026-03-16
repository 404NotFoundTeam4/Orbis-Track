import api from "../api/axios.js";

export interface LinePoint {
  label: string;
  value: number;
}

export interface MostBorrowedPoint {
  equipmentName: string;
  value: number;
}

export interface RepairStatusPoint {
  label: string;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface OverdueTicket {
  ticketId: number;
  userName: string;
  userEmail: string;
  userEmpCode: string | null;
  userImage: string | null;
  userRole: string;
  department: string | null;
  section: string | null;
  phone: string;
  equipments: string[];
  categories: string[];
  assetCodes: string[];
  quantity: number;
  purpose: string;
  location: string;
  staffName: string | null;
  delayedDays: number;
  returnDate: string;
  startDate: string;
}

export interface GetBorrowStatsResponse {
  year: number;
  points: LinePoint[];
}

export interface GetMostBorrowedEqResponse {
  year: number;
  points: MostBorrowedPoint[];
}

export interface GetRepairStatusResponse {
  year: number;
  points: RepairStatusPoint[];
}

export interface GetOverdueTableResponse {
  data: OverdueTicket[];
}

const getBorrowStats = async (year: number, quarter: number = 0): Promise<GetBorrowStatsResponse> => {
  const { data } = await api.get<{ data: GetBorrowStatsResponse }>(
    `/dashboard/borrow-stats`,
    { params: { year, quarter } }
  );
  return data.data;
};

const getMostBorrowedStats = async (year: number, quarter: number = 0): Promise<GetMostBorrowedEqResponse> => {
  const { data } = await api.get<{ data: GetMostBorrowedEqResponse }>(
    `/dashboard/most-borrowed`,
    { params: { year, quarter } }
  );
  return data.data;
};

const getRepairStatusStats = async (year: number, quarter: number = 0): Promise<GetRepairStatusResponse> => {
  const { data } = await api.get<{ data: GetRepairStatusResponse }>(
    `/dashboard/repair-status`,
    { params: { year, quarter } }
  );
  return data.data;
};

const getOverdueTable = async (): Promise<OverdueTicket[]> => {
  const { data } = await api.get<{ data: GetOverdueTableResponse }>(
    `/dashboard/overdue-table`
  );
  return data.data.data;
};

export const DashboardService = {
  getBorrowStats,
  getMostBorrowedStats,
  getRepairStatusStats,
  getOverdueTable,
};

export default DashboardService;
