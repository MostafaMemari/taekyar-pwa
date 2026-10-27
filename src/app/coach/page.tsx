import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { DashboardAttendance } from "@/features/coach/components/dashboard/dashboard-attendance";
import { DashboardExams } from "@/features/coach/components/dashboard/dashboard-exams";
import { DashboardHero } from "@/features/coach/components/dashboard/dashboard-hero";
import { DashboardInvitations } from "@/features/coach/components/dashboard/dashboard-invitations";
import { DashboardOverview } from "@/features/coach/components/dashboard/dashboard-overview";
import { DashboardSessions } from "@/features/coach/components/dashboard/dashboard-sessions";
import { GymContext } from "@/features/coach/components/gym-context";

export const metadata = { title: "داشبورد مربی" };

export default function CoachDashboardPage() {
  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <DashboardHero />

      <CoachSheet className="flex flex-col gap-6">
        <GymContext className="mt-1" />
        <DashboardOverview />
        <DashboardAttendance />
        <DashboardSessions />
        <DashboardInvitations />
        <DashboardExams />
      </CoachSheet>
    </main>
  );
}
