import AvatarLogin from "../components/AvatarLogin";


export const Users = () => {
  return (
    <>
      <AvatarLogin/>
      <div>
        <span>การจัดการ &gt;</span>
        <span>บัญชีผู้ใช้</span>
      </div>
      <h1>จัดการบัญชีผู้ใช้</h1>
      <table className="border-separate border border-gray-400 ...">
        <thead>
          <tr>
            <th>ชื่อผู้ใช้</th>
            <th>ตำแหน่ง</th>
            <th>แผนก</th>
            <th>ฝ่ายย่อย</th>
            <th>เบอร์ติดต่อ</th>
            <th>วันที่เพิ่ม</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Developer</td>
            <td>IT</td>
            <td>Software</td>
            <td>095-123-4567</td>
            <td>2025-08-22</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
export default Users;
