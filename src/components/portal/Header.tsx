"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const CATEGORIES = [
  { name: "मुख्यपृष्ठ",   slug: "/",                icon: "🏠" },
  { name: "जळगाव शहर",  slug: "/category/jalgaon-shahar", icon: "🏙️" },
  { name: "राजकारण",    slug: "/category/rajkaran",       icon: "🗳️" },
  { name: "क्रीडा",      slug: "/category/krida",          icon: "🏏" },
  { name: "व्यापार",    slug: "/category/vyapar",         icon: "💼" },
  { name: "शिक्षण",     slug: "/category/shikshan",       icon: "📚" },
  { name: "मनोरंजन",    slug: "/category/manoranjan",     icon: "🎬" },
  { name: "कृषी",       slug: "/category/krushi",         icon: "🌾" },
  { name: "गुन्हेगारी",  slug: "/category/gunhegari",      icon: "🚨" },
  { name: "⚡ Shorts",    slug: "/shorts",                  icon: ""   },
];

const FONT_SIZES = [14, 16, 17, 19, 21];
const FS_LABELS  = ["अ−", "अ", "अ+"];

interface HeaderProps {
  hideDarkMode?: boolean;
}

export default function Header({ hideDarkMode = false }: HeaderProps) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const [dark,        setDark]        = useState(false);
  const [fsIdx,       setFsIdx]       = useState(2); // default index 2 = 17px
  const [scrolled,    setScrolled]    = useState(false);

  // Load preferences
  useEffect(() => {
    const savedDark = localStorage.getItem("vk-dark") === "1";
    const savedFs   = parseInt(localStorage.getItem("vk-fs") || "2");
    setDark(savedDark);
    setFsIdx(savedFs);
    applyDark(savedDark);
    applyFs(savedFs);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function applyDark(on: boolean) {
    document.documentElement.classList.toggle("dark", on);
  }
  function applyFs(idx: number) {
    document.documentElement.style.setProperty("--fs-base", FONT_SIZES[idx] + "px");
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    applyDark(next);
    localStorage.setItem("vk-dark", next ? "1" : "0");
  }

  function changeFs(dir: number) {
    const next = Math.max(0, Math.min(FONT_SIZES.length - 1, fsIdx + dir));
    setFsIdx(next);
    applyFs(next);
    localStorage.setItem("vk-fs", String(next));
  }

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  const today = new Intl.DateTimeFormat("mr-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  return (
    <header
      className="sticky top-0 z-50 transition-shadow duration-200"
      style={{ background: "var(--header-bg)", boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.10)" : "none", borderBottom: "1px solid var(--border)" }}
    >
      {/* Top bar */}
      <div style={{ background: "var(--brand)", color: "#fff" }} className="py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{today}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-300 pulse inline-block" />
              <span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>थेट बातम्या</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
         <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
          <img src="/logo.png" alt="JalgaonVarta" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
          <div>
            <div className="font-black text-2xl leading-none" style={{ color: "#1B2D6B", fontFamily: "'Baloo 2', sans-serif" }}>
              JalgaonVarta
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-light)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              जळगावची वार्ता
            </div>
          </div>
        </Link>

        {/* Search — desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="बातमी शोधा..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text-primary)",
                fontFamily: "'Noto Sans Devanagari', sans-serif",
              }}
              className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
            />
            <button
              onClick={() => query.trim() && (window.location.href = `/search?q=${encodeURIComponent(query)}`)}
              style={{ color: "var(--brand)" }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Font size */}
          <div className="hidden sm:flex items-center gap-1">
            <button className="fs-btn" onClick={() => changeFs(-1)} title="Font size decrease">A−</button>
            <button className="fs-btn" onClick={() => changeFs(1)}  title="Font size increase">A+</button>
          </div>

          {!hideDarkMode && (
            <>
              {/* Dark mode */}
              <button
                onClick={toggleDark}
                className={`dark-toggle ${dark ? "on" : ""}`}
                title={dark ? "Light mode" : "Dark mode"}
                aria-label="Toggle dark mode"
              />
              <span className="text-sm hidden sm:block" style={{ color: "var(--text-light)" }}>
                {dark ? "🌙" : "☀️"}
              </span>
            </>
          )}

          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="बातमी शोधा..."
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            style={{
              background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text-primary)",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
          />
        </div>
      )}

      {/* Nav bar */}
      <nav
        style={{ borderTop: "1px solid var(--border)", background: "var(--header-bg)" }}
        className={`${menuOpen ? "block" : "hidden md:block"}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center gap-0 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className="flex-shrink-0">
                <Link
                  href={cat.slug}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                    color: "var(--text-secondary)",
                    fontSize: "var(--fs-sm)",
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 font-semibold hover:text-[--brand] transition-colors whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
