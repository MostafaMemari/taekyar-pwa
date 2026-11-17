"use client";

import { EllipsisVertical } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
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
import { StudentBand } from "./student-band";
import { StudentDetailActions } from "./student-detail-actions";
import { StudentDetailSkeleton } from "./student-detail-skeleton";
import { StudentFeePanel } from "./student-fee-panel";
import { StudentInfoPanel } from "./student-info-panel";
import { StudentMembershipsPanel } from "./student-memberships-panel";
import { StudentSpecsPanel } from "./student-specs-panel";

const STUDENT_DETAIL_TABS = ["info", "clubs", "fee", "specs"];

export function StudentDetail({ studentId }: { studentId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // The active tab lives in the URL, so a refresh or shared link lands on the same tab.
  const [tab, setTab] = useQueryState("tab", parseAsStringEnum(STUDENT_DETAIL_TABS).withDefault("info"));
  const student = useStudent(studentId);
  const attendance = useStudentAttendance(studentId);
  const clubs = useStudentClubs(studentId);
  // Opened from a club or class page: back returns there instead of the students list.
  const from = useSearchParams().get("from");
  const backHref = from?.startsWith("/coach/") ? from : "/coach/students";

  if (student.error) {
    const missing = student.error instanceof ApiError && student.error.status === 404;

    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="پرونده هنرجو" backHref="/coach/students" />
        {missing ? (
          <NotFoundScreen
            className="mt-4"
            title="این هنرجو پیدا نشد"
            description="پرونده ای با این نشانی در فهرست هنرجویان شما نیست. ممکن است حذف شده باشد یا متعلق به مربی دیگری باشد"
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
        backHref={backHref}
        meta={<span className="meta-glass">{profile.userId ? "دارای حساب کاربری" : "بدون حساب کاربری"}</span>}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="عملیات بیشتر"
            className="size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMenuOpen(true)}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <Tabs value={tab} onValueChange={(value) => setTab(value)} className="gap-3">
          <TabsList className="grid h-10 w-full grid-cols-4">
            <TabsTrigger value="info" className="px-1 text-[11px]">
              اطلاعات
            </TabsTrigger>
            <TabsTrigger value="clubs" className="px-1 text-[11px]">
              عضویت ها
            </TabsTrigger>
            <TabsTrigger value="fee" className="px-1 text-[11px]">
              شهریه
            </TabsTrigger>
            <TabsTrigger value="specs" className="px-1 text-[11px]">
              مشخصات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex flex-col gap-4">
            <StudentInfoPanel
              student={profile}
              attendance={attendance.data}
              attendanceError={attendance.error}
              onAttendanceRetry={() => void attendance.mutate()}
            />
          </TabsContent>
          <TabsContent value="clubs" className="flex flex-col gap-4">
            {clubs.error ? (
              <ErrorState title="خواندن عضویت ها انجام نشد" message={apiErrorMessage(clubs.error)} onRetry={() => void clubs.mutate()} />
            ) : (
              <StudentMembershipsPanel studentId={studentId} memberships={clubs.data ?? []} isLoading={!clubs.data} />
            )}
          </TabsContent>
          <TabsContent value="fee" className="flex flex-col gap-4">
            {clubs.error ? (
              <ErrorState title="خواندن شهریه انجام نشد" message={apiErrorMessage(clubs.error)} onRetry={() => void clubs.mutate()} />
            ) : (
              <StudentFeePanel studentId={studentId} memberships={clubs.data ?? []} isLoading={!clubs.data} />
            )}
          </TabsContent>
          <TabsContent value="specs" className="flex flex-col gap-4">
            <StudentSpecsPanel student={profile} />
            <StudentDetailActions studentId={studentId} fullName={profile.fullName} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
          </TabsContent>
        </Tabs>
      </CoachSheet>
    </main>
  );
}
