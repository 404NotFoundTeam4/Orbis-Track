const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonth() {
  return (
    <div className="bg-white rounded-2xl border p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">ธันวาคม 2025</h2>
        <div className="flex border rounded-xl overflow-hidden">
          <button className="px-4 py-1">Month</button>
          <button className="px-4 py-1 bg-gray-100">Week</button>
          <button className="px-4 py-1">Day</button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-t border-l">
        {days.map((d) => (
          <div
            key={d}
            className="border-r border-b text-center py-2 font-medium"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="h-[110px] border-r border-b p-2 text-sm relative"
          >
            <span className="absolute top-2 right-2 text-gray-400">
              {i + 1 <= 31 ? i + 1 : ""}
            </span>

            {i === 2 && (
              <div className="mt-6 bg-red-100 text-red-600 rounded-lg p-2 text-xs">
                อุปกรณ์ถูกยืม
                <div>8:30 AM - 11:30 AM</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
