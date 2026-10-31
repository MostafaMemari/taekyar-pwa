"use client";

import { AlertTriangle, Check, Loader2, Monitor, ShieldCheck, Smartphone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clearSession, getSessionId } from "@/features/auth/session";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useRevokeAccountSession, useRevokeAllAccountSessions } from "@/features/coach/hooks/use-account-session-mutations";
import { useAccountSessions } from "@/features/coach/hooks/use-account-sessions";
import type { AccountSession } from "@/features/coach/lib/account-session-api";
import { clearDataCache } from "@/lib/api/cache";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short", timeStyle: "short" });

function describeDevice(session: AccountSession) {
  if (session.deviceName) return session.deviceName;

  const ua = session.userAgent ?? "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "مرورگر";
  const os = /Windows/.test(ua)
    ? "ویندوز"
    : /Android/.test(ua)
      ? "اندروید"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X/.test(ua)
          ? "مک"
          : /Linux/.test(ua)
            ? "لینوکس"
            : "";

  return os ? `${browser} — ${os}` : browser;
}

function stateOf(session: AccountSession) {
  if (session.revokedAt) return "revoked" as const;
  if (new Date(session.expiresAt) < new Date()) return "expired" as const;
  return "active" as const;
}

function SessionCard({ session, current, onRevoke }: { session: AccountSession; current: boolean; onRevoke?: () => void }) {
  const state = stateOf(session);
  const isMobile = /Android|iPhone|iPad|iPod|mobile/i.test(session.platform ?? session.userAgent ?? "");
  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <Card
      className={cn(
        "flex-row items-start gap-3 rounded-2xl px-3.5 py-3.5",
        current && "bg-brand-50/50 ring-brand-200",
        state !== "active" && "opacity-80",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-ink-muted">
        <DeviceIcon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13px] font-extrabold text-ink">{describeDevice(session)}</p>
          {current ? (
            <StatusBadge tone="brand" className="shrink-0">
              <ShieldCheck aria-hidden="true" />
              نشست فعلی
            </StatusBadge>
          ) : state === "active" ? (
            <StatusBadge tone="success" className="shrink-0">
              <Check aria-hidden="true" />
              فعال
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral" className="shrink-0">
              <X aria-hidden="true" />
              {state === "revoked" ? "لغو شده" : "منقضی"}
            </StatusBadge>
          )}
        </div>

        <div className="mt-2 space-y-1 text-[11px] text-ink-subtle">
          <p className="flex items-center gap-1.5">
            <span className="shrink-0 font-semibold text-ink-muted">پلتفرم:</span>
            <span className="font-bold text-ink-body">{session.platform ?? "وب"}</span>
          </p>
          {session.ipAddress ? (
            <p className="flex items-center gap-1.5">
              <span className="shrink-0 font-semibold text-ink-muted">IP:</span>
              <span dir="ltr">{session.ipAddress}</span>
            </p>
          ) : null}
          <p>آخرین فعالیت: {dateTimeFormatter.format(new Date(session.lastUsedAt))}</p>
        </div>
      </div>

      {onRevoke ? (
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-lg border-danger/30 text-[10px] font-extrabold text-danger hover:bg-danger-soft hover:text-danger"
          onClick={onRevoke}
        >
          خروج از نشست
        </Button>
      ) : null}
    </Card>
  );
}

export function SecurityScreen() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useAccountSessions();
  const revoke = useRevokeAccountSession();
  const revokeAll = useRevokeAllAccountSessions();
  const [revokeTarget, setRevokeTarget] = useState<AccountSession | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const sessions = data ?? [];
  const currentId = getSessionId();
  const current = sessions.find((session) => session.id === currentId);
  const others = sessions.filter((session) => session.id !== currentId);

  const openRevoke = (session: AccountSession) => {
    revoke.reset();
    setRevokeTarget(session);
  };

  const openRevokeAll = () => {
    revokeAll.reset();
    setRevokeAllOpen(true);
  };

  const applyRevoke = async () => {
    if (!revokeTarget) return;

    try {
      await revoke.trigger(revokeTarget.id);
      setRevokeTarget(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const applyRevokeAll = async () => {
    try {
      await revokeAll.trigger();
      clearSession();
      void clearDataCache();
      router.replace("/login");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="نشست ها و دستگاه ها" backHref="/coach/settings" />

      {error ? (
        <ErrorState className="mt-4" title="خواندن نشست ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      ) : isLoading && !data ? (
        <div className="mt-5 flex flex-col gap-2.5">
          <Skeleton className="h-[132px] rounded-2xl" />
          <Skeleton className="h-[132px] rounded-2xl" />
        </div>
      ) : (
        <>
          {current ? (
            <section className="mt-5">
              <SectionHeading title="نشست فعلی" />
              <SessionCard session={current} current />
            </section>
          ) : null}

          <section className="mt-5">
            <SectionHeading title="سایر نشست ها" />
            {others.length === 0 ? (
              <Card className="rounded-2xl px-4 py-6 text-center text-[12px] font-semibold text-ink-muted">
                نشست دیگری روی این حساب ثبت نشده است.
              </Card>
            ) : (
              <div className="flex flex-col gap-2.5">
                {others.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    current={false}
                    onRevoke={stateOf(session) === "active" ? () => openRevoke(session) : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-danger/20 bg-danger-soft/40 p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold text-danger">
              <AlertTriangle className="size-4" aria-hidden="true" />
              منطقه خطر
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-danger/90">
              با لغو همه نشست ها از همه دستگاه ها خارج می شوید و باید دوباره وارد شوید.
            </p>
            <Button
              variant="destructive"
              className="mt-3 h-11 w-full rounded-xl bg-danger text-[12px] font-extrabold text-white hover:bg-danger/90"
              onClick={openRevokeAll}
              disabled={sessions.length === 0}
            >
              لغو همه نشست ها
            </Button>
          </section>
        </>
      )}

      <SheetFrame
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title="خروج از نشست"
        description="تایید خروج از نشست انتخاب شده"
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          نشست {revokeTarget ? describeDevice(revokeTarget) : ""} بسته می شود و برای استفاده از این دستگاه باید دوباره وارد شوید.
        </p>

        {revoke.error ? <p className="pt-2 text-[11px] font-bold leading-5 text-danger">{apiErrorMessage(revoke.error)}</p> : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setRevokeTarget(null)} disabled={revoke.isMutating}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl bg-danger text-[12px] font-extrabold text-white hover:bg-danger/90"
            onClick={applyRevoke}
            disabled={revoke.isMutating}
          >
            {revoke.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {revoke.isMutating ? "در حال خروج..." : "خروج از نشست"}
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame open={revokeAllOpen} onOpenChange={setRevokeAllOpen} title="لغو همه نشست ها" description="تایید لغو همه نشست ها">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          همه نشست ها از جمله نشست فعلی لغو می شوند و برای ادامه باید دوباره وارد حساب شوید.
        </p>

        {revokeAll.error ? <p className="pt-2 text-[11px] font-bold leading-5 text-danger">{apiErrorMessage(revokeAll.error)}</p> : null}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={() => setRevokeAllOpen(false)}
            disabled={revokeAll.isMutating}
          >
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl bg-danger text-[12px] font-extrabold text-white hover:bg-danger/90"
            onClick={applyRevokeAll}
            disabled={revokeAll.isMutating}
          >
            {revokeAll.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {revokeAll.isMutating ? "در حال لغو..." : "لغو همه نشست ها"}
          </Button>
        </div>
      </SheetFrame>
    </main>
  );
}
