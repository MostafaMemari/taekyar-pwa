import { CoachSheet } from "@/components/coach/coach-band";
import { GymContext } from "@/components/coach/coach-ui";
import { DashboardAttendance } from "@/components/coach/dashboard/dashboard-attendance";
import { DashboardExams } from "@/components/coach/dashboard/dashboard-exams";
import { DashboardHero } from "@/components/coach/dashboard/dashboard-hero";
import { DashboardInvitations } from "@/components/coach/dashboard/dashboard-invitations";
import { DashboardOverview } from "@/components/coach/dashboard/dashboard-overview";
import { DashboardSessions } from "@/components/coach/dashboard/dashboard-sessions";
import { DashboardTools } from "@/components/coach/dashboard/dashboard-tools";

export const metadata = { title: "داشبورد مربی" };

export default function CoachDashboardPage() {
  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <DashboardHero />

      <CoachSheet className="flex flex-col gap-6">
        <GymContext className="mt-1" />
        <DashboardOverview />
        <DashboardAttendance />
        <DashboardTools />
        <DashboardInvitations />
        <DashboardSessions />
        <DashboardExams />
      </CoachSheet>
    </main>
  );
}
