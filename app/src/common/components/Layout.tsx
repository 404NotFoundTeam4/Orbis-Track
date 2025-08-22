import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';  // นำเข้า Navbar ที่ต้องการใช้

export const Layout = () => {
  return (
    <div>
      {/* Navbar จะปรากฏในทุกหน้า */}
      <Navbar />
      <main>
        <Outlet /> {/* แสดง route child ที่ถูกกำหนด */}
      </main>
    </div>
  );
};
