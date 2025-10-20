/*
 * File: components/AlertDialog.tsx
 * Component: AlertDialog (Reusable + Flexible)
 * Spec-friendly (ตามภาพ) + ยืดหยุ่นด้วย props
 * - ไอคอน 104×104 + วงกลม (รับ icon จากภายนอกได้)
 * - Title 32px, Description 18px, ปุ่ม 112×46 ระยะห่าง 36 (แก้ได้ผ่าน props)
 * - ปิดได้ด้วย Overlay/ESC, a11y ครบ
 */
import React, { useEffect, useId } from "react";
import Button from "./Button";
import { Icon } from "@iconify/react";

export type AlertTone = "success" | "warning" | "danger";

export type AlertDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;

  /** Visual */
  tone?: AlertTone; // success=เขียว (default), warning=เหลือง, danger=แดง
  icon?: React.ReactNode; // รับ ReactNode เป็นไอคอน
  showRing?: boolean; // แสดงวงกลมรอบไอคอน

  /** Layout (ค่าตามภาพ ปรับได้) */
  width?: number; // default 610
  radius?: number; // default 16
  padX?: number; // default 83
  padY?: number; // default 43
  ringThickness?: number; // default 4 (ขอบวงไอคอน)
  iconSize?: number; // default 104
  titleTextPx?: number; // default 32
  descTextPx?: number; // default 18
  buttonsGap?: number; // default 36
  buttonW?: number; // default 112
  buttonH?: number; // default 46
  buttonTextPx?: number; // default 18

  /** Behavior */
  closeOnOverlay?: boolean; // default true
  closeOnEsc?: boolean; // default true

  /** Advanced */
  actions?: React.ReactNode; // ถ้าส่งมา จะใช้ footer แบบ custom แทนปุ่มมาตรฐาน
  className?: string;
};

const TONE_HEX: Record<AlertTone, string> = {
  success: "#52C41A",
  warning: "#FFC53D",
  danger: "#FF4D4F",
};

const CONFIRM_OVERRIDE: Record<AlertTone, string> = {
  success: "!bg-[#52C41A] hover:!bg-[#22b33a] !text-white",
  warning: "!bg-[#52C41A] hover:!bg-[#22b33a] !text-white", // ยืนยันปกติให้เขียว
  danger: "!bg-[#FF4D4F] hover:!bg-[#c71c34] !text-white",
};
// bg-[#52C41A] text-[#FFFFFF] hover:bg-green-700 active:bg-green-600
function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",

  tone = "success",
  icon,
  showRing = true,

  width = 610,
  radius = 42,
  padX = 83,
  padY = 43,
  ringThickness = 4,
  iconSize = 104,
  titleTextPx = 32,
  descTextPx = 18,
  buttonsGap = 36,
  buttonW = 112,
  buttonH = 46,
  buttonTextPx = 18,

  closeOnOverlay = true,
  closeOnEsc = true,

  actions,
  className,
}: AlertDialogProps) {
  const titleId = useId();
  const descId = useId();

  // ESC close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange?.(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onOpenChange]);

  if (!open) return null;

  const toneHex = TONE_HEX[tone];
  const confirmCls = CONFIRM_OVERRIDE[tone];

  /** default icon (ถ้าไม่ส่ง icon มา) */
  const DefaultIcon = (
    <span style={{ fontSize: iconSize * 0.6, lineHeight: 1 }}>!</span>
  );

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => closeOnOverlay && onOpenChange?.(false)}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cx(
          "relative mx-auto select-none bg-white shadow-2xl",
          "animate-in fade-in zoom-in-95",
          className,
        )}
        style={{
          width,
          borderRadius: radius,
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padY,
          paddingBottom: padY,
        }}
      >
        {/* Icon + ring (ใช้ inline style เพื่อรองรับค่า dynamic) */}
        <div
          className="mx-auto mb-6 flex items-center justify-center"
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: "9999px",
            border: showRing ? `${ringThickness}px solid ${toneHex}` : "none",
            color: toneHex, // ทำให้ icon ลูกหลาน inherit สี
          }}
        >
          {icon ?? DefaultIcon}
        </div>

        {/* Title / Description */}
        <h2
          id={titleId}
          className="text-center font-semibold text-black"
          style={{ fontSize: titleTextPx }}
        >
          {title}
        </h2>
        {description && (
          <p
            id={descId}
            className="mt-3 text-center leading-7 text-neutral-700"
            style={{ fontSize: descTextPx }}
          >
            {description}
          </p>
        )}

        {/* Footer */}
        {actions ? (
          <div
            className="mt-10 flex items-center justify-center"
            style={{ gap: buttonsGap }}
          >
            {actions}
          </div>
        ) : (
          <div
            className="mt-10 flex items-center justify-center"
            style={{ gap: buttonsGap }}
          >
            <Button
              variant="secondary"
              className={cx("rounded-full", `!text-[${buttonTextPx}px]`)}
              onClick={() => {
                onCancel?.();
                onOpenChange?.(false);
              }}
              style={{ width: buttonW, height: buttonH, padding: "5px 15px" }}
            >
              {cancelText}
            </Button>

            {/* ใช้ปุ่มของผู้ใช้ + override สีตาม tone */}
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              className={cx(
                "rounded-full",
                confirmCls,
                `!text-[${buttonTextPx}px]`,
              )}
              onClick={async () => {
                await onConfirm?.();
                onOpenChange?.(false);
              }}
              style={{ width: buttonW, height: buttonH, padding: "5px 15px" }}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
