import { sessionIsToday } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";

export function minutesOfDay(time: string) {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function pickNextSession(sessions: ClassSessionRecord[], now: Date) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = sessions
    .filter((session) => sessionIsToday(session.weekDays))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .find((session) => minutesOfDay(session.endTime) > nowMinutes);

  return next ? { session: next, isUpcoming: minutesOfDay(next.startTime) > nowMinutes } : null;
}
