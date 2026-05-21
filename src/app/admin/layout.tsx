import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/admin/SessionProvider";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: { default: "Admin | ViralKatta", template: "%s | Admin" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div style={{ fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" }}>{children}</div>;
  }

  return (
    <SessionProvider session={session}>
      <style>{`
        .admin-root, .admin-root *, .admin-root input, .admin-root textarea,
        .admin-root select, .admin-root button, .admin-root label {
          font-family: 'Noto Sans Devanagari', 'Mukta', system-ui, sans-serif !important;
        }
      `}</style>
      <div className="admin-root flex min-h-screen" style={{ background: "var(--bg, #F5F5F5)" }}>
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
