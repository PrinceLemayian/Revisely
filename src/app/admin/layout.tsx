import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  return (
    <div className="min-h-[calc(100vh-65px)] bg-cloud lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
