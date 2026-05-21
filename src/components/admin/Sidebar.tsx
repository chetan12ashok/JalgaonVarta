"use client";
// src/components/admin/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin",          label: "डॅशबोर्ड",      icon: "📊", exact: true },
  { href: "/admin/queue",    label: "Pending Queue",  icon: "📋" },
  { href: "/admin/articles", label: "सर्व बातम्या",   icon: "📰" },
  { href: "/admin/sources",  label: "Sources",        icon: "🌐" },
  { href: "/admin/categories", label: "Categories",   icon: "🏷️" },
  { href: "/admin/settings", label: "Settings",       icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40" style={{ fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" }}>
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/" target="_blank" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-lg font-display">VK</span>
          </div>
          <div>
            <div className="font-display font-bold text-lg text-orange-400 leading-none">ViralKatta</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "admin-nav-active shadow-lg shadow-orange-900/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/admin/queue" && (
                <PendingBadge />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <span>🌐</span>
          <span>Portal पहा</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-all"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Async badge for pending count
function PendingBadge() {
  return (
    <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      •
    </span>
  );
}
