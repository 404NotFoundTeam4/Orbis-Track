// services/api/department.service.ts
import api from "../api/axios";

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

export interface DeleteSectionPayload {
  sec_id: number;
}

export interface DeleteDepartmentPayload {
  dept_id: number;
}

/**
 * Description: โครงสร้างข้อมูล (Payload) สำหรับการเพิ่มฝ่ายย่อย (Section) ใหม่
 * Fields    :
 *   - dept_id (number): รหัสของแผนกที่ฝ่ายย่อยจะถูกเพิ่มเข้าไป
 *   - sec_name (string): ชื่อของฝ่ายย่อยที่ต้องการเพิ่ม
 * Usage     :
 *   - ใช้เป็นชนิดข้อมูล (interface) สำหรับส่งข้อมูลไปยัง API หรือ Service ที่ทำหน้าที่เพิ่มฝ่ายย่อย
 * Example   :
 *   const payload: AddSectionPayload = {
 *     dept_id: 1,
 *     sec_name: "ฝ่ายย่อยจัดการ",
 *   };
 * Author    : Salsabeela Sa-e (San) 66160349
 */
export interface AddSectionPayload {
  dept_id: number;
  sec_name: string;
}

// รูปแบบข้อมูลแผนกและฝ่ายย่อย
export interface GetDepartmentsWithSections {
  dept_id: number;
  dept_name: string;
  people_count: number;
  sections: {
    sec_id: number;
    sec_name: string;
    sec_dept_id: number;
    people_count: number;
  }[];
}

export interface AddDepartmentPayload {
  dept_name: string;
}

// Department API
export const departmentService = {
  // Get all departments
  getAllDepartments: async (): Promise<{ departments: Department[] }> => {
    const { data } = await api.get(`/departments`);
    return data;
  },

  // Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const { data } = await api.get(`/departments/${id}`);
    return data;
  },

  /**
   * Description: ดึงข้อมูลแผนกพร้อมฝ่ายย่อย
   * Input     : -
   * Output    : Promise<DepartmentsWithSectionsResponse> - ข้อมูลแผนกพร้อมฝ่ายย่อย
   * Endpoint  : GET /api/departments/section
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */

  getDepartmentsWithSections: async (): Promise<
    GetDepartmentsWithSections[]
  > => {
    const { data } = await api.get(`/departments/section`);
    return data.data.deptsection;
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
    const { data } = await api.put(`/departments/${id}`, payload);
    return data;
  },

  /**
   * Description: ลบข้อมูลแผนก (Department) ตามรหัสที่ระบุ
   * Input     :
   *   - id (number) - รหัสแผนกที่ต้องการลบ
   * Output    : Promise<{ message: string }> - ข้อความแจ้งผลการลบ
   * Endpoint  : DELETE /api/departments/:id
   * Author    : Niyada Butchan (Da) 66160361
   */
  deleteDepartment: async (
    payload: DeleteDepartmentPayload,
  ): Promise<{ message: string }> => {
    const { dept_id } = payload;
    const id = dept_id;
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  },

  /**
   * Description: เพิ่มแผนก
   * Author    : Sutaphat Thahin (Yeen) 66160378
   */
  addDepartment: async (
    payload: AddDepartmentPayload,
  ): Promise<{ message: string }> => {
    const { data } = await api.post(`/departments`, payload);
    return data;
  },
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
    const { data } = await api.put(
      `/departments/${deptId}/section/${secId}`,
      payload,
    );
    return data;
  },

  /**
   * Description: เรียกใช้งาน API สำหรับเพิ่มฝ่ายย่อย (Section) ใหม่ภายใต้แผนกที่เลือก
   * Input     :
   *   - payload (AddSecSchema): ข้อมูลที่ต้องใช้ในการเพิ่มฝ่ายย่อย ประกอบด้วย
   *       • dept_id (number)   - รหัสแผนก
   *       • sec_name (string)  - ชื่อฝ่ายย่อยที่ต้องการเพิ่ม
   * Output    : Promise<{ message: string }> - ข้อความแจ้งผลการเพิ่มฝ่ายย่อย
   * Endpoint  : POST /api/departments/:deptId/section
   * Logic     :
   *   - ส่งคำขอแบบ POST ไปยัง endpoint พร้อมข้อมูล dept_id และ sec_name
   *   - เมื่อเพิ่มสำเร็จ จะได้รับข้อความตอบกลับจากเซิร์ฟเวอร์
   * Author    : Salsabeela Sa-e (San) 66160349
   */
  addSection: async (
    payload: AddSectionPayload,
  ): Promise<{ message: string }> => {
    const { dept_id, sec_name } = payload;
    const { data } = await api.post(`/departments/${dept_id}/section`, {
      dept_id,
      sec_name,
    });
    return data;
  },

  /**
   * Description: ลบข้อมูลฝ่ายย่อย (Section) ตามรหัสที่ระบุ
   * Input     :
   *   - sec_id (DeleteSectionPayload) - รหัสฝ่ายย่อยที่ต้องการลบ
   * Output    : Promise<{ message: string }> - ข้อความแจ้งผลการลบ
   * Endpoint  : DELETE /api/department/section/:sec_id
   * Author    : Niyada Butchan(Da) 66160361
   */
  // ลบ section ด้วย sec_id
  deleteSection: async (
    payload: DeleteSectionPayload,
  ): Promise<{ message: string }> => {
    const { sec_id } = payload;
    const secId = sec_id;
    const { data } = await api.delete(`/departments/section/${secId}`);
    return data;
  },
};
