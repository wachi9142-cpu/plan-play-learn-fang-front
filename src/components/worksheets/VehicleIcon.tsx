/** ไอคอนยานพาหนะแบบ SVG ที่กำหนดสีได้ (ใช้ในใบงานจับคู่สี) */
export function VehicleIcon({ kind, color, size = 96 }: { kind: "motorbike" | "car"; color: string; size?: number }) {
  if (kind === "car") {
    return (
      <svg width={size} height={size * 0.6} viewBox="0 0 120 72" aria-hidden>
        <path d="M14 46 L24 26 Q28 20 36 20 L74 20 Q82 20 88 28 L100 44 L108 46 Q114 48 114 54 L114 58 L6 58 L6 52 Q6 47 14 46 Z" fill={color} stroke="#333" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 26 L40 26 L40 44 L24 44 Z M48 26 L72 26 L82 44 L48 44 Z" fill="#dff1ff" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="30" cy="58" r="10" fill="#333" /><circle cx="30" cy="58" r="4.5" fill="#ddd" />
        <circle cx="90" cy="58" r="10" fill="#333" /><circle cx="90" cy="58" r="4.5" fill="#ddd" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 120 74" aria-hidden>
      {/* ล้อ */}
      <circle cx="24" cy="54" r="15" fill="#333" /><circle cx="24" cy="54" r="7" fill="#ddd" />
      <circle cx="96" cy="54" r="15" fill="#333" /><circle cx="96" cy="54" r="7" fill="#ddd" />
      {/* ตัวถัง */}
      <path d="M36 52 L46 34 Q50 28 58 28 L74 28 L80 40 L92 42 L86 52 Z" fill={color} stroke="#333" strokeWidth="3" strokeLinejoin="round" />
      {/* เบาะ */}
      <path d="M40 30 Q48 20 66 22 L64 28 L46 30 Z" fill="#444" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
      {/* แฮนด์ + โคมไฟ */}
      <path d="M78 26 L88 14 L98 18" fill="none" stroke="#333" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="86" cy="30" r="5" fill="#fff4b0" stroke="#333" strokeWidth="2.5" />
      {/* ท่อไอเสีย */}
      <path d="M44 54 L66 56" stroke="#777" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
