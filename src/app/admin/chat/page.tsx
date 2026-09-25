import { requireAdmin } from "@/lib/auth";
import AdminChatClient from "./AdminChatClient";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  await requireAdmin();
  return <AdminChatClient />;
}
