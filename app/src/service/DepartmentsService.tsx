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

export interface AddDepartmentPayload {
  dept_name: string;
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

  /**
   * Description: อัพเดทชื่อแผนก
   * Input     : id (number) - รหัสแผนก, payload (UpdateDepartmentPayload) - ชื่อแผนกใหม่
   * Output    : Promise<{ message: string }> - ข้อความแจ้งผลการอัพเดท
   * Endpoint  : PUT /api/departments/:id
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  updateDepartment: async (
    id: number,
    payload: UpdateDepartmentPayload,
  ): Promise<{ message: string }> => {
    const { data } = await axios.put(`/api/departments/${id}`, payload);
    return data;
  },

   /**
   * Description: เพิ่มแผนก
   * Author    : Sutaphat Thahin (Yeen) 66160378
   */
  addDepartment: async (payload: AddDepartmentPayload): Promise<{ message: string }> => {
    const { data } = await axios.post(`/api/departments`, payload);
    return data;
  }
};

// Section API
export const sectionService = {
  /**
   * Description: อัพเดทชื่อส่วนงาน/ฝ่ายย่อย
   * Input     :
   *   - secId (number) - รหัสส่วนงาน
   *   - deptId (number) - รหัสแผนกที่สังกัด
   *   - payload (UpdateSectionPayload) - ชื่อส่วนงานใหม่
   * Output    : Promise<{ message: string }> - ข้อความแจ้งผลการอัพเดท
   * Endpoint  : PUT /api/departments/:deptId/section/:secId
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
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
