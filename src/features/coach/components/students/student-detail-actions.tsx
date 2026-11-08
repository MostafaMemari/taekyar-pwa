"use client";

import { BarChart3, ChevronLeft, Medal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoachActionMenu } from "@/features/coach/components/coach-action-menu";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useDeleteStudent } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

const ACTIONS = [
  { icon: Pencil, label: "ویرایش اطلاعات هنرجو", href: (id: string) => `/coach/students/${id}/edit` },
  { icon: Medal, label: "تخصیص کمربند", href: (id: string) => `/coach/students/${id}/belt` },
  { icon: BarChart3, label: "گزارش حضور و غیاب", href: (id: string) => `/coach/students/${id}/attendance` },
];

export function StudentDetailActions({
  studentId,
  fullName,
  menuOpen,
  onMenuOpenChange,
}: {
  studentId: string;
  fullName: string;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const remove = useDeleteStudent();

  const openDelete = () => {
    onMenuOpenChange(false);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await remove.trigger(studentId);
      setDeleteOpen(false);
      router.push("/coach/students");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
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
                className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12px] font-semibold text-ink-body hover:bg-muted/50"
                render={<Link href={action.href(studentId)} />}
                nativeButton={false}
              >
                <action.icon className="text-ink-muted" aria-hidden="true" />
                <span className="flex-1 text-start">{action.label}</span>
                <ChevronLeft className="text-ink-subtle" aria-hidden="true" />
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
            <p className="mt-1 text-[12px] leading-5 text-ink-muted">
              با حذف پروفایل، تمام سابقه حضور و غیاب و کمربند این هنرجو نیز حذف می شود.
            </p>
            <Button variant="destructive" size="sm" className="mt-3 rounded-lg text-[12px] font-semibold" onClick={openDelete}>
              حذف پروفایل
            </Button>
          </div>
        </div>
      </section>

      <SheetFrame open={menuOpen} onOpenChange={onMenuOpenChange} title="عملیات" description={`عملیات قابل انجام برای پرونده ${fullName}`}>
        <CoachActionMenu
          items={[
            ...ACTIONS.map((action) => ({
              icon: action.icon,
              label: action.label,
              onSelect: () => {
                onMenuOpenChange(false);
                router.push(action.href(studentId));
              },
            })),
            { icon: Trash2, label: "حذف پروفایل", tone: "danger" as const, onSelect: openDelete },
          ]}
        />
      </SheetFrame>

      <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف پروفایل" description="تایید حذف پروفایل هنرجو">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف پروفایل {fullName}، تمام سابقه حضور و غیاب و کمربند او نیز حذف می شود. این کار قابل بازگشت نیست.
        </p>
        <AuthFormError message={remove.error ? apiErrorMessage(remove.error) : ""} />
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setDeleteOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
            disabled={remove.isMutating}
            onClick={() => void confirmDelete()}
          >
            {remove.isMutating ? "در حال حذف..." : "حذف پروفایل"}
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
