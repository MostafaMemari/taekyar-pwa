"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ClipboardList,
  ListFilter,
  ListOrdered,
  type LucideIcon,
  Medal,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
  Type,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  type AgeGroup,
  BELT_META,
  type BeltKey,
  type CoachStudent,
  INSURANCE_META,
  type InsuranceStatus,
  STUDENTS,
  studentBeltLabel,
} from "@/components/coach/coach-data";
import { GymContext, PersonAvatar, StatusBadge } from "@/components/coach/coach-ui";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

type SortKey = "default" | "name" | "belt" | "ins";

const BELT_ORDER: BeltKey[] = ["white", "yellow", "green", "blue", "red", "black"];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "kids", label: "کودکان" },
  { value: "teens", label: "نوجوانان" },
  { value: "adults", label: "بزرگسالان" },
];

const INSURANCE_ICONS: Record<InsuranceStatus, LucideIcon> = {
  ok: ShieldCheck,
  soon: ShieldAlert,
  none: ShieldX,
};

const INSURANCE_TILE_TONES: Record<InsuranceStatus, string> = {
  ok: "bg-success-soft text-success",
  soon: "bg-warning-soft text-warning",
  none: "bg-danger-soft text-danger",
};

const INSURANCE_FILTERS = (["ok", "soon", "none"] as const).map((value) => ({
  value,
  label: INSURANCE_META[value].label,
  count: STUDENTS.filter((student) => student.insurance === value).length,
}));

const SORT_OPTIONS: { value: SortKey; label: string; description: string; icon: LucideIcon; tile: string }[] = [
  { value: "default", label: "ترتیب ثبت نام", description: "همان ترتیب پیش فرض لیست", icon: ListOrdered, tile: "bg-muted text-ink-muted" },
  { value: "name", label: "نام و نام خانوادگی", description: "بر اساس حروف الفبا", icon: Type, tile: "bg-brand-50 text-accent-ink" },
  { value: "belt", label: "رتبه کمربند", description: "از بالاترین به پایین ترین", icon: Medal, tile: "bg-warning-soft text-warning" },
  { value: "ins", label: "تاریخ بیمه", description: "نزدیک ترین انقضا در بالا", icon: ShieldAlert, tile: "bg-danger-soft text-danger" },
];

function normalizeMulti<T extends string>(next: readonly string[], current: readonly T[]): T[] {
  const specific = next.filter((value) => value !== "all") as T[];
  return next.includes("all") && current.length > 0 ? [] : specific;
}

function InsuranceBadge({ student }: { student: CoachStudent }) {
  const meta = INSURANCE_META[student.insurance];
  const Icon = INSURANCE_ICONS[student.insurance];

  return (
    <StatusBadge tone={meta.tone} className="shrink-0 px-1.5 py-[3px] text-[8.5px]">
      <Icon aria-hidden="true" />
      {student.insurance === "none" ? "بدون بیمه" : `بیمه تا ${toPersianDigits(student.insuranceDate ?? "")}`}
    </StatusBadge>
  );
}

function StudentCard({ student }: { student: CoachStudent }) {
  const belt = BELT_META[student.belt];

  return (
    <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3 transition duration-150 active:scale-[0.995]">
      <PersonAvatar name={student.name} />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <b className="truncate text-[13.5px] font-extrabold text-ink">{student.name}</b>
          <StatusBadge tone={student.hasAccount ? "brand" : "neutral"} className="shrink-0 px-1.5 py-0.5 text-[8.5px]">
            {student.hasAccount ? "دارای حساب" : "بدون حساب"}
          </StatusBadge>
        </span>
        <span className="mt-1.5 flex items-center gap-1.5">
          <InsuranceBadge student={student} />
          <span className="truncate text-[10.5px] text-ink-subtle">
            {student.ageLabel} • {student.className}
          </span>
        </span>
      </span>

      <span className="flex w-14 shrink-0 flex-col items-center gap-1">
        <BeltStrip color={belt.color} outline={belt.outline} stripes={student.dan ?? 0} className="size-auto w-12" />
        <span className="text-[8.5px] font-extrabold leading-none text-ink-muted">{toPersianDigits(studentBeltLabel(student))}</span>
      </span>

      <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
    </Card>
  );
}

export function StudentsDirectory() {
  const [query, setQuery] = useState("");
  const [belts, setBelts] = useState<BeltKey[]>([]);
  const [ages, setAges] = useState<AgeGroup[]>([]);
  const [insurance, setInsurance] = useState<InsuranceStatus | null>(null);
  const [sort, setSort] = useState<SortKey>("default");
  const [addOpen, setAddOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const normalizedQuery = toLatinDigits(query).trim().toLowerCase();

  const visible = STUDENTS.filter((student) => {
    if (belts.length > 0 && !belts.includes(student.belt)) return false;
    if (ages.length > 0 && !ages.includes(student.ageGroup)) return false;
    if (insurance && student.insurance !== insurance) return false;
    if (!normalizedQuery) return true;

    const haystack = toLatinDigits(
      `${student.name} ${student.nationalCode} ${studentBeltLabel(student)} ${student.ageLabel} ${student.className}`,
    ).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorted = [...visible].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "fa");
    if (sort === "belt") {
      const byRank = BELT_META[b.belt].rank - BELT_META[a.belt].rank;
      return byRank !== 0 ? byRank : (b.dan ?? 0) - (a.dan ?? 0);
    }
    if (sort === "ins") return a.insuranceDays - b.insuranceDays;
    return 0;
  });

  const filterCount = belts.length + ages.length + (insurance ? 1 : 0);
  const isDirty = filterCount > 0 || query.trim().length > 0;

  const clearFilters = () => {
    setQuery("");
    setBelts([]);
    setAges([]);
    setInsurance(null);
  };

  return (
    <>
      <header className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold text-ink">هنرجویان</h1>
        <StatusBadge tone="neutral" className="mt-0.5">
          <Users aria-hidden="true" />
          <b className="tabular-nums">{toPersianDigits(String(sorted.length))}</b>
          <span>هنرجو</span>
        </StatusBadge>
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="ms-auto h-8 rounded-xl px-3 text-[11px] font-bold"
          onClick={() => setAddOpen(true)}
        >
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          افزودن
        </Button>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {INSURANCE_FILTERS.map((option) => {
          const Icon = INSURANCE_ICONS[option.value];
          const active = insurance === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="field"
              aria-pressed={active}
              onClick={() => setInsurance(active ? null : option.value)}
              className={cn(
                "h-auto flex-col gap-1.5 rounded-2xl px-2 py-2.5 whitespace-normal",
                active && "border-primary/35 bg-brand-50/60 ring-2 ring-primary/15",
              )}
            >
              <span className={cn("grid size-8 place-items-center rounded-xl", INSURANCE_TILE_TONES[option.value])}>
                <Icon aria-hidden="true" />
              </span>
              <b className="text-[15px] leading-none font-extrabold tabular-nums text-ink">{toPersianDigits(String(option.count))}</b>
              <span className="text-[9px] leading-none font-bold text-ink-muted">{option.label}</span>
            </Button>
          );
        })}
      </div>

      <GymContext className="mt-3" subtitle="لیست هنرجویان این باشگاه" actionLabel="تغییر باشگاه" />

      <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line-2)] bg-[var(--canvas)]/95 px-4 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <InputGroup className="h-11 min-w-0 flex-1 rounded-xl">
            <InputGroupInput
              type="search"
              placeholder="جستجو بر اساس نام، کد ملی یا کلاس..."
              aria-label="جستجوی هنرجو"
              className="text-[13px]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Search className="size-4 text-ink-subtle" aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>

          <Button
            type="button"
            variant="field"
            size="icon"
            aria-label="مرتب سازی"
            aria-haspopup="dialog"
            aria-expanded={sortOpen}
            className="relative size-11 shrink-0 rounded-xl"
            onClick={() => setSortOpen(true)}
          >
            <ArrowUpDown aria-hidden="true" />
            {sort !== "default" ? <span className="absolute end-2 top-2 size-1.5 rounded-full bg-brand-500" aria-hidden="true" /> : null}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink-muted">
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            فیلترها
            {filterCount > 0 ? (
              <span className="grid min-w-[15px] place-items-center rounded-full bg-brand-500 px-1 text-center text-[8.5px] leading-[15px] font-extrabold text-white tabular-nums">
                {toPersianDigits(String(filterCount))}
              </span>
            ) : null}
          </span>

          {isDirty ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 gap-1 px-1.5 text-[10.5px] font-extrabold text-destructive"
              onClick={clearFilters}
            >
              <X data-icon="inline-start" aria-hidden="true" />
              پاک کردن همه
            </Button>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[8.5px] font-bold text-ink-subtle">
              <ListFilter className="size-2.5" aria-hidden="true" />
              انتخاب چندگانه
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] font-bold text-ink-subtle">کمربند</span>
          <ToggleGroup
            aria-label="فیلتر کمربند"
            multiple
            value={belts.length > 0 ? belts : ["all"]}
            onValueChange={(next) => setBelts((current) => normalizeMulti(next, current))}
            variant="outline"
            spacing={1.5}
            className="no-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5"
          >
            <ToggleGroupItem value="all" className="h-7 rounded-full px-3 text-[10px] font-bold">
              همه
            </ToggleGroupItem>
            {BELT_ORDER.map((belt) => (
              <ToggleGroupItem
                key={belt}
                value={belt}
                aria-label={`کمربند ${BELT_META[belt].label}`}
                className="h-7 gap-1.5 rounded-full px-2.5 text-[10px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                <BeltStrip color={BELT_META[belt].color} outline={BELT_META[belt].outline} className="size-auto w-[26px]" />
                <span>{BELT_META[belt].label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] font-bold text-ink-subtle">رده سنی</span>
          <ToggleGroup
            aria-label="فیلتر رده سنی"
            multiple
            value={ages.length > 0 ? ages : ["all"]}
            onValueChange={(next) => setAges((current) => normalizeMulti(next, current))}
            variant="outline"
            spacing={1.5}
            className="no-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5"
          >
            <ToggleGroupItem value="all" className="h-7 rounded-full px-3 text-[10px] font-bold">
              همه
            </ToggleGroupItem>
            {AGE_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-7 rounded-full px-3 text-[10px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {sorted.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <Empty className="mt-4 border-none bg-transparent p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
              <Users aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-[13px] font-extrabold text-ink">هنرجویی یافت نشد</EmptyTitle>
            <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">
              ترکیب فیلترها یا عبارت جستجو را تغییر دهید.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={clearFilters}>
              پاک کردن فیلترها
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <div className="fixed inset-x-0 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-[430px] px-4">
        <Button
          type="button"
          variant="field"
          className="h-auto w-full justify-start gap-3 rounded-2xl border-[var(--card-line)] bg-card/95 px-3 py-2.5 whitespace-normal shadow-[var(--card-shadow)] backdrop-blur transition active:scale-[0.99]"
          onClick={() => setAddOpen(true)}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 text-start">
            <b className="block text-[13px] font-extrabold text-ink">افزودن هنرجوی جدید</b>
            <span className="mt-0.5 block text-[10.5px] font-medium text-ink-subtle">با فرم ثبت نام یا ارسال دعوت نامه</span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-[9.5px] font-extrabold text-accent-ink">۲ روش</span>
        </Button>
      </div>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto w-full max-w-md rounded-t-3xl px-5 pt-2 pb-[max(18px,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden="true" />

          <SheetHeader className="flex-row items-center gap-2 p-0">
            <SheetTitle className="flex-1 text-base font-extrabold text-ink">افزودن هنرجو</SheetTitle>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="بستن" />}>
              <X aria-hidden="true" />
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">روش افزودن هنرجوی جدید را انتخاب کنید.</SheetDescription>

          <div className="flex flex-col gap-2">
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="field"
                  className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 whitespace-normal"
                />
              }
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
                <ClipboardList aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-start">
                <b className="block text-[13px] font-extrabold text-ink">فرم ثبت هنرجوی جدید</b>
                <span className="text-[11px] font-medium text-ink-subtle">ثبت پروفایل کامل هنرجو</span>
              </span>
            </SheetClose>

            <SheetClose
              render={
                <Button
                  type="button"
                  variant="field"
                  className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 whitespace-normal"
                />
              }
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
                <Send aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-start">
                <b className="block text-[13px] font-extrabold text-ink">دعوت با شماره تماس یا کد ملی</b>
                <span className="text-[11px] font-medium text-ink-subtle">ارسال دعوت نامه به هنرجو</span>
              </span>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto w-full max-w-md rounded-t-3xl px-5 pt-2 pb-[max(18px,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden="true" />

          <SheetHeader className="flex-row items-center gap-2 p-0">
            <SheetTitle className="flex-1 text-base font-extrabold text-ink">مرتب سازی هنرجویان</SheetTitle>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="بستن" />}>
              <X aria-hidden="true" />
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">ترتیب نمایش هنرجویان را انتخاب کنید.</SheetDescription>

          <RadioGroup
            value={sort}
            onValueChange={(value) => {
              setSort(value as SortKey);
              setSortOpen(false);
            }}
            className="gap-2"
          >
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <Label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-input bg-field px-3 py-2.5 shadow-field transition-colors hover:bg-muted/40",
                    sort === option.value && "border-primary/35 bg-brand-50/60",
                  )}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[13px] font-extrabold text-ink">{option.label}</b>
                    <span className="text-[11px] font-medium text-ink-subtle">{option.description}</span>
                  </span>
                  <RadioGroupItem value={option.value} />
                </Label>
              );
            })}
          </RadioGroup>
        </SheetContent>
      </Sheet>
    </>
  );
}
