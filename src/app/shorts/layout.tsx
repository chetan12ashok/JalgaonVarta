// src/app/shorts/layout.tsx
// Shorts gets its own layout — no header, no footer, full screen
export const metadata = {
  title: "ViralKatta Shorts | ताज्या बातम्या ६० शब्दांत",
  description: "जळगावच्या ताज्या बातम्या ६० शब्दांत — ViralKatta Shorts",
};

export default function ShortsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>
      {children}
    </div>
  );
}
