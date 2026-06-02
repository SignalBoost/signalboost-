import { redirect } from "next/navigation";

// The Executive cockpit moved into the Admin workspace (/admin), which is
// gated by the is_admin() RPC. Non-admins hitting /admin are bounced to "/".
// So /dashboard simply forwards there and is no longer a public page.
export default function DashboardPage() {
  redirect("/admin");
}
