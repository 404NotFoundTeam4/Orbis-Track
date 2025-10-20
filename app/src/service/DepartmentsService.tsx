// services/api/department.service.ts
import axios from "axios";

// Types
export interface Department {
  dept_id: number;
  dept_name: string;
}

export interface Section {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
}

export interface UpdateDepartmentPayload {
  department: string;
}

export interface UpdateSectionPayload {
  section: string;
}

// Department API
export const departmentService = {
  // Get all departments
  getAllDepartments: async (): Promise<{ departments: Department[] }> => {
    const { data } = await axios.get(`/api/departments`);
    return data;
  },

  // Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const { data } = await axios.get(`/api/departments/${id}`);
    return data;
  },

  // Update department
  updateDepartment: async (
    id: number,
    payload: UpdateDepartmentPayload,
  ): Promise<{ message: string }> => {
    const { data } = await axios.put(`/api/departments/${id}`, payload);
    return data;
  },
};

// Section API
export const sectionService = {
  // Update section
  updateSection: async (
    secId: number,
    deptId: number,
    payload: UpdateSectionPayload,
  ): Promise<{ message: string }> => {
    const { data } = await axios.put(
      `/api/departments/${deptId}/section/${secId}`,
      payload,
    );
    return data;
  },
};
