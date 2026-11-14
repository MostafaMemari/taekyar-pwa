import { type inferParserType, parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs";
import { WEEK_DAY_ORDER, type WeekDay } from "@/features/coach/lib/coach-data";

export const SESSION_FILTER_STATUSES = ["ACTIVE", "INACTIVE", "ALL"] as const;
export type SessionFilterStatus = (typeof SESSION_FILTER_STATUSES)[number];

// The sessions list keeps filters in the URL like the students page; active-only is the everyday view.
export const sessionFilterParsers = {
  status: parseAsStringEnum<SessionFilterStatus>([...SESSION_FILTER_STATUSES]).withDefault("ACTIVE"),
  club: parseAsString.withDefault(""),
  days: parseAsArrayOf(parseAsStringEnum<WeekDay>([...WEEK_DAY_ORDER])).withDefault([]),
};

export type SessionFilters = inferParserType<typeof sessionFilterParsers>;

export const SESSION_STATUS_META: Record<SessionFilterStatus, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  ALL: "همه",
};

export function activeSessionFilterCount({ status, club, days }: SessionFilters) {
  return (status !== "ACTIVE" ? 1 : 0) + (club ? 1 : 0) + days.length;
}
