import { ACTIVE_CLUB, type ClassSession, type WeekDay } from "@/lib/coach/coach-data";

export type SessionFormState = {
  name: string;
  clubId: string;
  days: WeekDay[];
  start: string;
  end: string;
};

export type SessionFormUpdater = <K extends keyof SessionFormState>(field: K, value: SessionFormState[K]) => void;

export function emptySessionForm(): SessionFormState {
  return {
    name: "",
    clubId: ACTIVE_CLUB.id,
    days: ["SATURDAY", "MONDAY"],
    start: "17:00",
    end: "18:30",
  };
}

export function sessionToForm(session: ClassSession): SessionFormState {
  return {
    name: session.name,
    clubId: session.clubId,
    days: session.weekDays,
    start: session.start,
    end: session.end,
  };
}
