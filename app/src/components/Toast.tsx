import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  PropsWithChildren,
} from "react";
import { Icon } from "@iconify/react";

type ToastTone = "danger" | "confirm" | "success" | "warning" | "info";

export type ToastOptions = {
  id?: string;
  tone?: ToastTone;
  message: React.ReactNode; // "ลบอุปกรณ์เสร็จสิ้น!"
  duration?: number; // ms (ปิดเอง) — default 3000
  width?: number; // default 372
  minHeight?: number; // default 70
  onClose?: () => void;
};

type ToastInternal = Required<Pick<ToastOptions, "id">> &
  ToastOptions & { leaving?: boolean };

const SCHEME: Record<
  "danger" | "confirm" | "warning" | "info",
  { accent: string; bar: string; icon: string }
> = {
  // ตามที่ขอ
  danger: { accent: "#DF203B", bar: "#F696A3", icon: "ep:warning-filled" },
  confirm: {
    accent: "#73D13D",
    bar: "#95DE64",
    icon: "material-symbols-light:check-circle-rounded",
  },

  // ตัวอื่นๆ เผื่อเรียกใช้งาน
  warning: { accent: "#FFC53D", bar: "#FFE58F", icon: "mdi:alert-outline" },
  info: { accent: "#40A9FF", bar: "#91CAFF", icon: "mdi:information-outline" },
};

const ToastCtx = createContext<{
  toasts: ToastInternal[];
  push: (opt: ToastOptions) => string;
  dismiss: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: PropsWithChildren<{}>) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const dismiss = useCallback((id: string) => {
    // set leaving flag ให้ ToastCard เล่นอนิเมชันออก
    setToasts((list) =>
      list.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    // ค่อยลบจริงหลัง 250ms (ต้องพอๆ กับ duration ใน ToastCard)
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const push = useCallback(
    (opt: ToastOptions) => {
      const id = opt.id ?? crypto.randomUUID();
      const item: ToastInternal = {
        id,
        tone: opt.tone ?? "confirm",
        message: opt.message,
        duration: opt.duration ?? 3000,
        width: opt.width ?? 372,
        minHeight: opt.minHeight ?? 70,
        onClose: opt.onClose,
      };
      setToasts((t) => [item, ...t]); // อันใหม่อยู่บน
      if (item.duration! > 0) {
        window.setTimeout(() => dismiss(id), item.duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}

      {/* Stack ขวาบน; ให้กว้างอิสระและชิดขวา */}
      <div className="pointer-events-none fixed right-5 top-5 z-[120] flex flex-col items-end gap-3 max-w-[min(100vw-40px,820px)]">
        {toasts.map((t) => (
          <ToastCard
            key={t.id}
            {...t}
            onClose={() => {
              t.onClose?.();
              dismiss(t.id);
            }}
          />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider/>");
  return ctx;
}

/* --------------------------- Visual Toast Card --------------------------- */
function ToastCard({
  tone = "confirm",
  message,
  width = 372,
  minHeight = 70,
  leaving,
  onClose,
}: ToastInternal) {
  // รองรับคนที่ยังส่ง "success" = ใช้ schema ของ "confirm"
  const key = tone === "success" ? "confirm" : tone;
  const scheme = SCHEME[key as keyof typeof SCHEME];

  // enter animation (slide+fade) แบบ react-hot-toast feel
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const transition =
    "transition-[opacity,transform] duration-250 ease-out will-change-transform";

  return (
    <div
      className={`pointer-events-auto select-none bg-white shadow-sm rounded-[16px] ${transition}`}
      style={{
        width,
        minHeight,
        borderColor: scheme.accent,
        borderStyle: "solid",
        borderWidth: 1.5,
        // slide-in/out
        opacity: leaving ? 0 : mounted ? 1 : 0,
        transform: leaving
          ? "translateY(-6px) scale(0.98)"
          : mounted
            ? "translateY(0) scale(1)"
            : "translateY(-8px) scale(0.98)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 10, padding: "15px 15px" }}
      >
        {/* แท็บซ้าย: แสดงตลอด */}
        <div
          className="rounded-full"
          style={{
            width: 4,
            height: 33,
            backgroundColor: scheme.bar,
          }}
        />

        {/* วงกลมไอคอน 44×44 — กรอบสี accent, ไอคอนสี accent */}
        <div className="grid place-items-center">
          <Icon
            icon={scheme.icon}
            width={45}
            height={45}
            color={scheme.accent}
          />
        </div>

        {/* ข้อความ 16 Medium */}
        <div
          className="flex-1 font-medium"
          style={{ fontSize: 16, color: "#686868" }}
        >
          {message}
        </div>

        {/* ปุ่มปิด 23×23 */}
        <button
          aria-label="Close toast"
          onClick={onClose}
          className="grid place-items-center rounded-full hover:bg-gray-50 transition-colors"
          style={{ width: 30, height: 30 }}
        >
          <Icon
            icon="lets-icons:close-ring-light"
            width={30}
            height={30}
            color="686868"
          />
        </button>
      </div>
    </div>
  );
}
