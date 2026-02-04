import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin-overview";

import { AdminDashboard } from "./AdminDashboard.client";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth");
  if (session.user.role !== "admin") redirect("/");

  const overview = await getAdminOverview();

  return <AdminDashboard overview={overview} />;
}
