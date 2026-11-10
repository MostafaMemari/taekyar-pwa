"use client";

import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import type { StudentDetailRecord } from "@/features/coach/lib/student-api";
import { apiErrorMessage } from "@/lib/api/client";
import { StudentAttendancePanel } from "./student-attendance-panel";
import { StudentAttendanceTrend } from "./student-attendance-trend";
import { StudentBeltPanel } from "./student-belt-panel";
import { StudentInsurancePanel } from "./student-insurance-panel";
import { StudentMembershipRenew } from "./student-membership-renew";

export function StudentInfoPanel({
  student,
  attendance,
  attendanceError,
  onAttendanceRetry,
}: {
  student: StudentDetailRecord;
  attendance?: StudentAttendance;
  attendanceError?: unknown;
  onAttendanceRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <StudentBeltPanel studentId={student.id} assignment={student.currentBelt} birthDate={student.birthDate} />

      <StudentInsurancePanel expiryDate={student.sportsInsuranceDate} studentId={student.id} />

      <StudentMembershipRenew studentId={student.id} membershipYear={student.membershipYear} />

      <section>
        <SectionHeading title="حضور و غیاب" />
        {attendanceError ? (
          <ErrorState title="خواندن حضور و غیاب انجام نشد" message={apiErrorMessage(attendanceError)} onRetry={onAttendanceRetry} />
        ) : (
          <StudentAttendancePanel studentId={student.id} attendance={attendance} />
        )}
      </section>

      {attendance ? <StudentAttendanceTrend records={attendance.records} /> : null}
    </div>
  );
}
