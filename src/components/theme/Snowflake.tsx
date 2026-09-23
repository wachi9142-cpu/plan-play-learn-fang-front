/**
 * ❄️ เกล็ดหิมะคริสตัล 6 แฉก — วาดด้วย SVG จึงคมทุกขนาด ไม่ต้องโหลดไฟล์ภาพ
 * (ไล่สีฟ้า–ขาวแบบเดียวกับเกล็ดหิมะของจริง)
 */
export function Snowflake({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`sf-${id}`} x1="18%" y1="8%" x2="82%" y2="94%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="34%" stopColor="#d6e8fb" />
          <stop offset="70%" stopColor="#8db8ec" />
          <stop offset="100%" stopColor="#4a7fd0" />
        </linearGradient>
      </defs>
      <g
        stroke={`url(#sf-${id})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* หนึ่งแฉก แล้วหมุนซ้ำ 6 ครั้ง ๆ ละ 60° */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <path d="M50 50 V9" />
            <path d="M50 14 L41 5 M50 14 L59 5" />
            <path d="M50 22 L37 13 M50 22 L63 13" />
            <path d="M50 34 L39 26 M50 34 L61 26" />
          </g>
        ))}
      </g>
    </svg>
  );
}
