"use client";
export default function BreakingTicker({ headlines }: { headlines: string[] }) {
  if (!headlines.length) return null;
  const text = headlines.join("   •   ");
  return (
    <div className="overflow-hidden py-2" style={{ background: "#000", color: "#fff" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <span
          className="flex-shrink-0 text-xs font-black px-3 py-1 rounded"
          style={{ background: "#FFD735", color: "#000", fontFamily: "'Noto Sans Devanagari', sans-serif", letterSpacing: "0.5px" }}
        >
          🔴 ताज्या
        </span>
        <div className="overflow-hidden flex-1 relative">
          <span
            className="ticker-text text-sm font-medium"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
