import { useEffect, useState } from "react";
import BorrowModal from "../components/BorrowDate/BorrowModal";
import DatePickerField from "../components/DatePickerField";
import DateValue from "../components/BorrowDate/DateValue";
 import { borrowService} from "../services/BorrowService"

export interface ActiveBorrow {
  da_start: string; 
  da_end: string;   
}

type Device = {
  dec_id: number;
  dec_serial_number: string;
  dec_asset_code: string;
  dec_status: string;
  activeBorrow:  ActiveBorrow[];
};

function BorrowModalDate() {
  const [open,setOpen] = useState(true)
  const [data, setData] = useState<Device | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
     null,
     null,
   ]);

  useEffect(() => {
  const fetchData = async () => {
  try {
    const res = await borrowService.getAvailable(1);
    setData(res)
  } catch (error) {
    console.error("API error:", error);
  }
};


  fetchData();
}, []);

return (
    <div className="p-6">

      <BorrowModal
      defaultValues={data}
        open={open}
         onConfirm={(data) => {
    console.log("รับค่าจาก modal", data);
  }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default BorrowModalDate;
