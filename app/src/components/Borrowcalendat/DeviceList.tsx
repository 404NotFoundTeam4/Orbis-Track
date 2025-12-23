const devices = [
  { id: 1, code: "EX-01", status: "available" },
  { id: 2, code: "EX-01", status: "borrowed" },
  { id: 3, code: "EX-01", status: "borrowed" },
];

export function DeviceList() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold">รายการอุปกรณ์</h2>
        <span className="bg-green-100 text-green-600 text-sm px-2 py-0.5 rounded-full">
          ว่าง 1 / 5
        </span>
      </div>

      {devices.map((d) => (
        <div
          key={d.id}
          className={`flex items-center justify-between mb-2 p-3 rounded-xl border
          ${d.status === "available" ? "border-green-300" : "border-red-300"}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full
              ${d.status === "available" ? "bg-green-500" : "bg-red-500"}`}
            />
            <span>{d.code}</span>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-sm
            ${d.status === "available"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"}`}
          >
            {d.status === "available" ? "พร้อมยืม" : "ถูกยืม"}
          </span>
        </div>
      ))}
    </div>
  );
}
