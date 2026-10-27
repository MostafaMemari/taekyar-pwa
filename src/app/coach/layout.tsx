import { RequireSession } from "@/features/auth/components/session-guard";
import { CoachTabBar } from "@/features/coach/components/coach-tab-bar";

export default function CoachLayout({ children }: LayoutProps<"/coach">) {
  return (
    <RequireSession forRole="COACH">
      <div className="app-frame">
        {children}
        <CoachTabBar />
      </div>
    </RequireSession>
  );
}
