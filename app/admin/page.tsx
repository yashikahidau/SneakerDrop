import type { Metadata } from "next";
import { isAdminSession } from "@/lib/admin-auth";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const instant = false;
export const metadata: Metadata = {
  title: "Restricted Atelier | SneakerDrop",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await isAdminSession();
  return authenticated ? <AdminDashboard /> : <AdminLogin />;
}
