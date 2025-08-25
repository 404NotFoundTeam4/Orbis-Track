// LangDropdown.tsx
import { useEffect, useRef, useState } from "react";


type Item = { label: string; value: string };
export default function LangDropdown({
  value,
  items,                 // ✅ รับจากภายนอก
}: {
  value?: "EN" ;

  items: Item[];
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [language,setlaguage] = useState(value);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        menuRef.current && btnRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span className="font-semibold">{language}</span>
        <svg viewBox="0 0 10 6" className="w-2.5 h-2.5 text-white/80" aria-hidden="true">
          <path d="M0 0h10L5 6z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-36 rounded-md bg-[#2f2f2f] text-white text-sm shadow-lg ring-1 ring-white/10 overflow-hidden z-50"
        >
          {items.map(it => (
            <button
              key={it.value}
              role="menuitem"
              onClick={() => {  setOpen(false);
              setlaguage(it.value) }}
              className="block w-full text-left px-3 py-2 hover:bg-white/10"
              
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
