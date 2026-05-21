"use client";
// ReadingToolbar.tsx — Reading experience toolbar
// Features: Progress bar, Read time, Font size A+/A-, Dark mode, Reading mode

import { useState, useEffect } from "react";

interface Props {
  content: string;
  title:   string;
}

function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 150));
}

const FONT_SIZES = [14, 16, 17, 19, 21, 23];

export default function ReadingToolbar({ content, title }: Props) {
  const [progress,    setProgress]    = useState(0);
  const [fsIdx,       setFsIdx]       = useState(2);
  const [dark,        setDark]        = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const mins = readTime(content);

  // ── Load saved prefs ──────────────────────────────────────────────────
  useEffect(() => {
    const savedFs   = parseInt(localStorage.getItem("vk-fs")   || "2");
    const savedDark = localStorage.getItem("vk-dark") === "1";
    setFsIdx(savedFs);
    setDark(savedDark);
    applyFs(savedFs);
    applyDark(savedDark);
  }, []);

  // ── Reading progress bar ──────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Reading mode — hide everything except article ─────────────────────
  useEffect(() => {
    const header  = document.querySelector("header") as HTMLElement | null;
    const sidebar = document.getElementById("article-sidebar");
    const footer  = document.querySelector("footer") as HTMLElement | null;
    const more    = document.getElementById("article-more");
    const wrapper = document.getElementById("article-wrapper");

    if (readingMode) {
      [header, sidebar, footer, more].forEach((el) => { if (el) el.style.display = "none"; });
      if (wrapper) { wrapper.style.maxWidth = "680px"; wrapper.style.margin = "0 auto"; }
      document.body.style.background = dark ? "#111" : "#FAFAF8";
    } else {
      [header, sidebar, footer, more].forEach((el) => { if (el) el.style.display = ""; });
      if (wrapper) { wrapper.style.maxWidth = ""; wrapper.style.margin = ""; }
      document.body.style.background = "";
    }
  }, [readingMode, dark]);

  function applyFs(idx: number) {
    document.documentElement.style.setProperty("--fs-base", FONT_SIZES[idx] + "px");
  }
  function applyDark(on: boolean) {
    document.documentElement.classList.toggle("dark", on);
  }
  function changeFs(dir: number) {
    const next = Math.max(0, Math.min(FONT_SIZES.length - 1, fsIdx + dir));
    setFsIdx(next);
    applyFs(next);
    localStorage.setItem("vk-fs", String(next));
  }
  function toggleDark() {
    const next = !dark;
    setDark(next);
    applyDark(next);
    localStorage.setItem("vk-dark", next ? "1" : "0");
  }

  const btnStyle = (active = false): React.CSSProperties => ({
    padding:    "5px 12px",
    borderRadius: "8px",
    fontSize:   "12px",
    fontWeight: 600,
    cursor:     "pointer",
    border:     `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
    background: active ? "var(--brand)" : "var(--bg)",
    color:      active ? "#fff" : "var(--text-primary)",
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  });

  const divider = (
    <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 2px", flexShrink: 0 }} />
  );

  return (
    <>
      {/* ── Reading progress bar ── */}
      <div style={{
        position:   "fixed", top: 0, left: 0, height: "3px",
        width:      `${progress}%`,
        background: "var(--brand)",
        zIndex:     9999,
        transition: "width 0.1s linear",
        boxShadow:  "0 0 6px var(--brand)",
      }} />

      {/* ── Toolbar ── */}
      <div style={{
        position:     "sticky",
        top:          0,
        zIndex:       100,
        background:   "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        padding:      "8px 0",
        marginBottom: "20px",
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>

            {/* Read time */}
            <span style={{
              fontSize:   "var(--fs-sm)",
              color:      "var(--text-light)",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
              marginRight: 4,
              whiteSpace: "nowrap",
            }}>
              ⏱ {mins} मिनिट{mins > 1 ? "े" : ""}
            </span>

            {divider}

            {/* Font size */}
            <button
              onClick={() => changeFs(-1)}
              disabled={fsIdx === 0}
              style={{ ...btnStyle(), opacity: fsIdx === 0 ? 0.4 : 1, fontSize: "11px" }}
            >
              A−
            </button>
            <button
              onClick={() => changeFs(1)}
              disabled={fsIdx === FONT_SIZES.length - 1}
              style={{ ...btnStyle(), opacity: fsIdx === FONT_SIZES.length - 1 ? 0.4 : 1, fontSize: "14px" }}
            >
              A+
            </button>

            {divider}

            {/* Reading mode */}
            <button onClick={() => setReadingMode((r) => !r)} style={btnStyle(readingMode)}>
              {readingMode ? "📖 सामान्य" : "📖 वाचन मोड"}
            </button>

            {/* Dark mode — right side */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>{dark ? "🌙" : "☀️"}</span>
              <div
                onClick={toggleDark}
                style={{
                  width: "36px", height: "20px", borderRadius: "10px",
                  cursor: "pointer",
                  background: dark ? "var(--brand)" : "var(--border)",
                  position: "relative",
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position:     "absolute",
                  top:          "3px",
                  left:         dark ? "19px" : "3px",
                  width:        "14px",
                  height:       "14px",
                  borderRadius: "50%",
                  background:   "#fff",
                  transition:   "left 0.25s",
                  boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Reading mode exit banner ── */}
      {readingMode && (
        <div
          onClick={() => setReadingMode(false)}
          style={{
            position:    "fixed",
            bottom:      "20px",
            left:        "50%",
            transform:   "translateX(-50%)",
            padding:     "10px 24px",
            borderRadius: "20px",
            zIndex:      200,
            background:  "var(--brand)",
            color:       "#fff",
            fontSize:    "13px",
            fontFamily:  "'Noto Sans Devanagari', sans-serif",
            boxShadow:   "0 4px 20px rgba(0,0,0,0.25)",
            cursor:      "pointer",
            whiteSpace:  "nowrap",
          }}
        >
          📖 वाचन मोड चालू — बंद करण्यासाठी दाबा ✕
        </div>
      )}
    </>
  );
}
