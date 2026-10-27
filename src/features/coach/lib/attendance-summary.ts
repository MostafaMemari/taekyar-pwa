export type AttendanceCounts = {
  present: number;
  late: number;
  absent: number;
  excused?: number;
  total?: number;
};

export function attendanceTotal(counts: AttendanceCounts) {
  return counts.total ?? counts.present + counts.late + counts.absent + (counts.excused ?? 0);
}

export function attendanceRate(counts: AttendanceCounts) {
  const total = attendanceTotal(counts);
  return total > 0 ? Math.round((counts.present / total) * 100) : 0;
}
