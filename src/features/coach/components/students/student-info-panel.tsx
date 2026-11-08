"use client";

import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import type { StudentDetailRecord } from "@/features/coach/lib/student-api";
import { StudentAttendanceTrend } from "./student-attendance-trend";
import { StudentBeltPanel } from "./student-belt-panel";
import { StudentInsurancePanel } from "./student-insurance-panel";

export function StudentInfoPanel({ student, attendance }: { student: StudentDetailRecord; attendance?: StudentAttendance }) {
  return (
    <div className="flex flex-col gap-4">
      <StudentBeltPanel assignment={student.currentBelt} birthDate={student.birthDate} />

      <StudentInsurancePanel expiryDate={student.sportsInsuranceDate} studentId={student.id} />

      {attendance ? <StudentAttendanceTrend records={attendance.records} /> : null}
    </div>
  );
}
