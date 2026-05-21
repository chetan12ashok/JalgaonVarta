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
    return <div>{children}</div>;
  }

  return (
    <SessionProvider session={session}>
      <div className="admin-root flex min-h-screen" style={{ background: "#F5F5F5" }}>
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
