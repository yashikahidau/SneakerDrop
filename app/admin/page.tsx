import { isAdminSession } from "@/lib/admin-auth";

export const instant = false;
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const authenticated = await isAdminSession();
  return authenticated ? <AdminDashboard /> : <AdminLogin />;
}
