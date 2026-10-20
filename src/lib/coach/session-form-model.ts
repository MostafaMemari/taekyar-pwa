import { ACTIVE_CLUB, type ClassSession } from "@/lib/coach/coach-data";

export type SessionFormState = {
  name: string;
  clubId: string;
  capacity: string;
  days: string[];
  start: string;
  end: string;
};

export type SessionFormUpdater = <K extends keyof SessionFormState>(field: K, value: SessionFormState[K]) => void;

export function emptySessionForm(): SessionFormState {
  return {
    name: "",
    clubId: ACTIVE_CLUB.id,
    capacity: "",
    days: ["شنبه", "دوشنبه"],
    start: "17:00",
    end: "18:30",
  };
}

export function sessionToForm(session: ClassSession): SessionFormState {
  const memberCount = session.attendance?.total ?? session.members ?? 0;

  return {
    name: session.name,
    clubId: session.clubId,
    capacity: String(memberCount + 2),
    days: session.days,
    start: session.start,
    end: session.end,
  };
}
