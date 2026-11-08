import { type inferParserType, parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs";
import type { StudentFeedQuery } from "@/features/coach/lib/student-api";
import {
  AGE_CATEGORY_NAMES,
  BELT_API_NAMES,
  INSURANCE_STATUSES,
  SORT_FIELDS,
  type StudentSortDirection,
} from "@/features/coach/lib/students-options";

export const studentFilterParsers = {
  q: parseAsString.withDefault(""),
  belt: parseAsArrayOf(parseAsStringEnum([...BELT_API_NAMES])).withDefault([]),
  age: parseAsArrayOf(parseAsStringEnum([...AGE_CATEGORY_NAMES])).withDefault([]),
  ins: parseAsArrayOf(parseAsStringEnum([...INSURANCE_STATUSES])).withDefault([]),
  sort: parseAsStringEnum([...SORT_FIELDS]).withDefault("createdAt"),
  dir: parseAsStringEnum<StudentSortDirection>(["asc", "desc"]).withDefault("desc"),
};

export type StudentFilters = inferParserType<typeof studentFilterParsers>;

export function toStudentQuery(filters: StudentFilters, search: string): StudentFeedQuery {
  return {
    search: search.trim() || undefined,
    belt: filters.belt.length > 0 ? filters.belt : undefined,
    ageCategory: filters.age.length > 0 ? filters.age : undefined,
    insurance: filters.ins.length > 0 ? filters.ins : undefined,
    sortBy: filters.sort,
    sortDirection: filters.dir,
  };
}

export function activeFilterCount(filters: StudentFilters) {
  return filters.belt.length + filters.age.length + filters.ins.length;
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
