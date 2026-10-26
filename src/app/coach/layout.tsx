import { CoachTabBar } from "@/features/coach/components/coach-tab-bar";

export default function CoachLayout({ children }: LayoutProps<"/coach">) {
  return (
    <div className="app-frame">
      {children}
      <CoachTabBar />
    </div>
  );
}
