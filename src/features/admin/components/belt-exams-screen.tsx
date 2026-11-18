"use client";

import { ChevronLeft, Plus, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminBand } from "@/features/admin/components/admin-band";
import { BeltExamSaveSheet } from "@/features/admin/components/belt-exam-save-sheet";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import type { BeltExamRecord } from "@/features/coach/lib/exam-api";
import { examFillPercent } from "@/features/coach/lib/exam-api";
import { examBeltRangeOf } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { durationLabel, toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

type ExamView = "upcoming" | "held";

type ExamPhase = "held" | "today" | "last-day" | "closed" | "open";

const EXAM_PHASE_META: Record<ExamPhase, { label: string; tone: "neutral" | "danger" | "warning" | "success"; tile: string }> = {
  held: { label: "برگزار شده", tone: "neutral", tile: "bg-muted text-ink-muted" },
  today: { label: "برگزاری امروز", tone: "danger", tile: "bg-danger-soft text-danger" },
  "last-day": { label: "آخرین روز ثبت نام", tone: "danger", tile: "bg-danger-soft text-danger" },
  closed: { label: "پایان ثبت نام", tone: "warning", tile: "bg-warning-soft text-warning" },
  open: { label: "در حال ثبت نام", tone: "success", tile: "bg-success-soft text-success" },
};

// Day-level ISO strings keep the phase compare clean of timezone hour drift.
function localIsoDate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function examPhaseOf(exam: BeltExamRecord, todayIso: string): ExamPhase {
  const event = exam.eventDate.slice(0, 10);
  const register = exam.registerDate.slice(0, 10);

  if (event < todayIso) return "held";
  if (event === todayIso) return "today";
  if (register === todayIso) return "last-day";
  if (register < todayIso) return "closed";
  return "open";
}

export function BeltExamsScreen() {
  const { data: exams, error, isLoading, mutate } = useBeltExams();
  const [view, setView] = useState<ExamView>("upcoming");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BeltExamRecord | null>(null);

  const todayIso = localIsoDate(new Date());
  const inView = (exams ?? []).filter((exam) =>
    view === "held" ? exam.eventDate.slice(0, 10) < todayIso : exam.eventDate.slice(0, 10) >= todayIso,
  );
  // Order comes from the API (eventDate desc): newest dates on top, oldest at the bottom.
  const list = inView;

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (exam: BeltExamRecord) => {
    setEditing(exam);
    setSheetOpen(true);
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="آزمون های کمربند"
          icon={Trophy}
          backHref="/admin"
          chip={
            exams ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(list.length))} آزمون
              </span>
            ) : null
          }
        />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5 pb-44", PAGE_ENTER)}>
        <ToggleGroup
          aria-label="وضعیت آزمون ها"
          value={[view]}
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) setView(selected as ExamView);
          }}
          variant="segmented"
          spacing={1}
          className="w-full rounded-full bg-muted p-1"
        >
          <ToggleGroupItem
            value="upcoming"
            className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
          >
            برگزار نشده
          </ToggleGroupItem>
          <ToggleGroupItem
            value="held"
            className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
          >
            برگزار شده
          </ToggleGroupItem>
        </ToggleGroup>

        {isLoading && !error ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-[88px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="خواندن آزمون ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : list.length === 0 ? (
          <p className="py-10 text-center text-[12px] font-medium text-ink-subtle">
            {view === "held" ? "هنوز آزمونی برگزار نشده است" : "دوره جدیدی اعلام نشده است"}
          </p>
        ) : (
          list.map((exam) => <BeltExamRow key={exam.id} exam={exam} todayIso={todayIso} onSelect={openEdit} />)
        )}
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <Button
          type="button"
          variant="brand"
          aria-haspopup="dialog"
          className="pointer-events-auto h-12 gap-2 rounded-full px-5 text-[13px] font-bold active:scale-95"
          onClick={openCreate}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          آزمون جدید
        </Button>
      </div>

      <BeltExamSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} exam={editing} />
    </main>
  );
}

function BeltExamRow({ exam, todayIso, onSelect }: { exam: BeltExamRecord; todayIso: string; onSelect: (exam: BeltExamRecord) => void }) {
  const phase = examPhaseOf(exam, todayIso);
  const meta = EXAM_PHASE_META[phase];
  const beltRange = examBeltRangeOf(exam.belts);
  const held = phase === "held";
  const percent = held ? 100 : examFillPercent(exam);
  // Exact day gap between two pure dates; both sides parse as UTC midnights so no hour drift.
  const dayOf = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime();
  const daysLeft = Math.round((dayOf(exam.eventDate) - dayOf(todayIso)) / DAY_MS);
  const today = new Date(`${todayIso}T00:00:00`);
  const eventDay = new Date(`${exam.eventDate.slice(0, 10)}T00:00:00`);

  return (
    <button type="button" onClick={() => onSelect(exam)} className="block w-full text-start transition duration-150 active:scale-[0.995]">
      <Card className={cn("flex-row items-center gap-3 rounded-2xl px-3 py-3", held && "opacity-60")}>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", meta.tile)} aria-hidden="true">
          <Trophy className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <b className="flex items-center gap-1.5 truncate text-[13px] font-extrabold text-ink">
            <span className="truncate">{toPersianDigits(exam.name)}</span>
            <StatusBadge tone={meta.tone} className="shrink-0 px-1.5 py-[3px] text-[11px]">
              {meta.label}
            </StatusBadge>
          </b>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-ink-subtle">
            <span>دوره {toPersianDigits(String(exam.examNumber))}</span>
            {beltRange ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{beltRange}</span>
              </>
            ) : null}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] font-medium tabular-nums text-ink-subtle">
            <span>ثبت نام تا {toPersianDigits(toJalaliDate(exam.registerDate))}</span>
            <span aria-hidden="true">·</span>
            <span>برگزاری {toPersianDigits(toJalaliDate(exam.eventDate))}</span>
            {!held && daysLeft > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-ink-muted">{durationLabel(today, eventDay)} مانده</span>
              </>
            ) : null}
          </span>

          {!held ? (
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--line-2)]">
              <div
                className="bar-fill block h-full w-full rounded-full transition-[clip-path] duration-500 motion-safe:animate-[bar-reveal_900ms_cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  clipPath: `inset(0 ${100 - Math.max(1, percent)}% 0 0)`,
                  backgroundColor: percent >= 80 ? "var(--st-green)" : percent >= 50 ? "var(--st-orange)" : "var(--st-red)",
                }}
              />
            </div>
          ) : null}
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
