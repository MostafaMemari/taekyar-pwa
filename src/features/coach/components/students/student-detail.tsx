"use client";

import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { NotFoundScreen } from "@/components/shared/not-found-screen";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { useStudentAttendance } from "@/features/coach/hooks/use-attendance";
import { useStudentClubs } from "@/features/coach/hooks/use-clubs";
import { useStudent } from "@/features/coach/hooks/use-student";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { StudentAttendancePanel } from "./student-attendance-panel";
import { StudentBand } from "./student-band";
import { StudentClubsPanel } from "./student-clubs-panel";
import { StudentDetailActions } from "./student-detail-actions";
import { StudentDetailSkeleton } from "./student-detail-skeleton";
import { StudentInfoPanel } from "./student-info-panel";

export function StudentDetail({ studentId }: { studentId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const student = useStudent(studentId);
  const attendance = useStudentAttendance(studentId);
  const clubs = useStudentClubs(studentId);

  if (student.error) {
    const missing = student.error instanceof ApiError && student.error.status === 404;

    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="پرونده هنرجو" backHref="/coach/students" />
        {missing ? (
          <NotFoundScreen
            className="mt-4"
            title="این هنرجو پیدا نشد"
            description="پرونده ای با این نشانی در فهرست هنرجویان شما نیست. ممکن است حذف شده باشد یا متعلق به مربی دیگری باشد."
            backHref="/coach/students"
            backLabel="بازگشت به هنرجویان"
          />
        ) : (
          <ErrorState
            className="mt-4"
            title="خواندن پرونده هنرجو انجام نشد"
            message={apiErrorMessage(student.error)}
            onRetry={() => void student.mutate()}
          />
        )}
      </main>
    );
  }

  if (!student.data) return <StudentDetailSkeleton />;

  const profile = student.data;
  const belt = profile.currentBelt ? beltKeyOf(profile.currentBelt.belt.name) : null;
  const clubName = clubs.data?.[0]?.club.name ?? null;

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <StudentBand
        fullName={profile.fullName}
        belt={belt}
        clubName={clubName}
        backHref="/coach/students"
        meta={<span className="meta-glass">{profile.userId ? "دارای حساب کاربری" : "بدون حساب کاربری"}</span>}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="عملیات بیشتر"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMenuOpen(true)}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <Tabs defaultValue="info" className="gap-3">
          <TabsList className="grid h-10 w-full grid-cols-3">
            <TabsTrigger value="info" className="text-[12px]">
              اطلاعات
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-[12px]">
              حضور و غیاب
            </TabsTrigger>
            <TabsTrigger value="clubs" className="text-[12px]">
              باشگاه ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <StudentInfoPanel student={profile} attendance={attendance.data} />
          </TabsContent>
          <TabsContent value="attendance">
            {attendance.error ? (
              <ErrorState
                title="خواندن حضور و غیاب انجام نشد"
                message={apiErrorMessage(attendance.error)}
                onRetry={() => void attendance.mutate()}
              />
            ) : (
              <StudentAttendancePanel studentId={studentId} attendance={attendance.data} />
            )}
          </TabsContent>
          <TabsContent value="clubs">
            {clubs.error ? (
              <ErrorState title="خواندن باشگاه ها انجام نشد" message={apiErrorMessage(clubs.error)} onRetry={() => void clubs.mutate()} />
            ) : (
              <StudentClubsPanel memberships={clubs.data ?? []} isLoading={!clubs.data} />
            )}
          </TabsContent>
        </Tabs>

        <StudentDetailActions studentId={studentId} fullName={profile.fullName} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      </CoachSheet>
    </main>
  );
}
