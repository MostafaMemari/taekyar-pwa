import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { RequireSession } from "@/features/auth/components/require-session";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RequireSession forRole="ADMIN">
      <div className="app-frame">
        {children}
        <nav className="coach-tabbar" aria-label="ناوبری مدیریت">
          <Link href="/admin" aria-current="page" className="coach-tab is-active col-start-3">
            <span className="coach-tab-ico">
              <ShieldCheck aria-hidden="true" />
            </span>
            <span>پنل مدیریت</span>
          </Link>
        </nav>
      </div>
    </RequireSession>
  );
}
