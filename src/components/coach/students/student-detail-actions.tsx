"use client";

import { BarChart3, ChevronLeft, Medal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { SectionHeading } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StudentProfile } from "@/lib/coach/student-profile-data";

const ACTIONS = [
  { icon: Pencil, label: "ویرایش اطلاعات هنرجو", href: (id: string) => `/coach/students/${id}/edit` },
  { icon: Medal, label: "تخصیص کمربند", href: (id: string) => `/coach/students/${id}/belt` },
  { icon: BarChart3, label: "گزارش حضور و غیاب", href: (id: string) => `/coach/students/${id}/attendance` },
];

export function StudentDetailActions({
  profile,
  menuOpen,
  onMenuOpenChange,
}: {
  profile: StudentProfile;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openDelete = () => {
    onMenuOpenChange(false);
    setDeleteOpen(true);
  };

  return (
    <>
      <section>
        <SectionHeading title="عملیات پرونده" />
        <Card className="gap-0 p-0">
          {ACTIONS.map((action, index) => (
            <Fragment key={action.label}>
              {index > 0 ? <Separator /> : null}
              <Button
                variant="ghost"
                className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12.5px] font-extrabold text-ink-body hover:bg-muted/50"
                render={<Link href={action.href(profile.id)} />}
                nativeButton={false}
              >
                <action.icon className="text-ink-muted" aria-hidden="true" />
                <span className="flex-1 text-start">{action.label}</span>
                <ChevronLeft className="text-ink-faint" aria-hidden="true" />
              </Button>
            </Fragment>
          ))}
        </Card>
      </section>

      <section className="rounded-2xl border border-destructive/15 bg-danger-soft/40 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-[13px] font-extrabold text-destructive">حذف پروفایل</b>
            <p className="mt-1 text-[11px] leading-5 text-ink-muted">
              با حذف پروفایل، تمام سابقه حضور و غیاب و کمربند این هنرجو نیز حذف می شود.
            </p>
            <Button variant="destructive" size="sm" className="mt-3 rounded-lg text-[11px] font-extrabold" onClick={openDelete}>
              حذف پروفایل
            </Button>
          </div>
        </div>
      </section>

      <SheetFrame
        open={menuOpen}
        onOpenChange={onMenuOpenChange}
        title="عملیات"
        description={`عملیات قابل انجام برای پرونده ${profile.name}`}
      >
        <div className="flex flex-col gap-1 py-1">
          {ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-ink-body"
              onClick={() => {
                onMenuOpenChange(false);
                router.push(action.href(profile.id));
              }}
            >
              <action.icon className="text-ink-muted" aria-hidden="true" />
              {action.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
            onClick={openDelete}
          >
            <Trash2 aria-hidden="true" />
            حذف پروفایل
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف پروفایل" description="تایید حذف پروفایل هنرجو">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          با حذف پروفایل {profile.name}، تمام سابقه حضور و غیاب و کمربند او نیز حذف می شود. این کار قابل بازگشت نیست.
        </p>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setDeleteOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12.5px] font-extrabold"
            onClick={() => {
              setDeleteOpen(false);
              router.push("/coach/students");
            }}
          >
            حذف پروفایل
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
