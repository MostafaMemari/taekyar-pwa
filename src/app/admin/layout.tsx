import { RequireSession } from "@/features/auth/components/require-session";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RequireSession forRole="ADMIN">
      <div className="app-frame">{children}</div>
    </RequireSession>
  );
}
