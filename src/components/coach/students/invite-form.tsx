"use client";

import { CircleAlert, ClipboardList, IdCard, Send, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ActionDock, FormSection } from "@/components/coach/coach-form";
import { PersonAvatar, SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { AuthField } from "@/components/shared/auth-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INVITATION_STATUS_META, INVITATIONS } from "@/lib/coach/coach-data";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const FLOW_NOTES = [
  {
    icon: IdCard,
    tone: "text-info",
    text: "کد ملی هنرجو باید از قبل در سامانه ثبت شده باشد تا دعوت نامه برای او ارسال شود.",
  },
  {
    icon: ShieldCheck,
    tone: "text-success",
    text: "دعوت فقط برای هنرجوی بدون مربی و با جنسیت یکسان با شما قابل ارسال است.",
  },
  {
    icon: UserPlus,
    tone: "text-accent-ink",
    text: "هنرجو دعوت را در اپ خود تایید یا رد می کند؛ پس از تایید، به فهرست شاگردان شما اضافه می شود.",
  },
  {
    icon: CircleAlert,
    tone: "text-warning",
    text: "تا زمان پاسخ هنرجو، وضعیت دعوت نامه «در انتظار» باقی می ماند.",
  },
];

export function InviteForm() {
  const router = useRouter();
  const [nationalCode, setNationalCode] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/coach/invitations");
  };

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <FormSection icon={IdCard} title="کد ملی هنرجو">
        <p className="-mt-2 text-start text-[11px] font-medium leading-5 text-ink-muted">
          کد ملی ۱۰ رقمی هنرجو را وارد کنید؛ دعوت نامه برای پروفایل موجود او در سامانه ارسال می شود.
        </p>

        <AuthField label="کد ملی" htmlFor="inviteNationalCode" required>
          <Input
            id="inviteNationalCode"
            name="nationalCode"
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder={toPersianDigits("0012345678")}
            value={toPersianDigits(nationalCode)}
            onChange={(event) => setNationalCode(digitsOnly(event.target.value, 10))}
            className="h-12 rounded-xl px-4 text-center text-sm font-bold tracking-widest"
          />
        </AuthField>
      </FormSection>

      <section>
        <SectionHeading
          title="دعوت نامه های اخیر"
          action={
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink"
              render={<Link href="/coach/invitations" />}
              nativeButton={false}
            >
              همه
            </Button>
          }
        />
        <Card className="gap-0 p-0">
          {INVITATIONS.slice(0, 3).map((invitation, index) => {
            const meta = INVITATION_STATUS_META[invitation.status];
            const Icon = meta.icon;

            return (
              <div
                key={invitation.id}
                className={index > 0 ? "flex items-center gap-3 border-t border-[var(--line-2)] p-4" : "flex items-center gap-3 p-4"}
              >
                <PersonAvatar name={invitation.studentName ?? invitation.nationalCode} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold text-ink">{invitation.studentName ?? "هنرجوی بدون حساب"}</p>
                  <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-subtle">
                    کد ملی <span dir="ltr">{toPersianDigits(invitation.nationalCode)}</span> · ارسال: {invitation.sentAt}
                  </p>
                </div>
                <StatusBadge tone={meta.tone} className="shrink-0">
                  <Icon aria-hidden="true" />
                  {meta.label}
                </StatusBadge>
              </div>
            );
          })}
        </Card>
      </section>

      <Card className="gap-2 bg-muted/50 p-3.5 text-[11px] leading-5 text-ink-muted ring-0">
        <p className="font-bold text-ink-body">روند دعوت نامه چگونه است؟</p>
        {FLOW_NOTES.map((note) => (
          <p key={note.text} className="flex items-start gap-1.5">
            <note.icon className={cn("mt-0.5 size-3.5 shrink-0", note.tone)} aria-hidden="true" />
            <span>{note.text}</span>
          </p>
        ))}
      </Card>

      <Button
        variant="outline"
        className="h-11 w-full rounded-xl text-[12px] font-extrabold"
        render={<Link href="/coach/students/new" />}
        nativeButton={false}
      >
        <ClipboardList data-icon="inline-start" aria-hidden="true" />
        ثبت مستقیم پروفایل هنرجو
      </Button>

      <ActionDock>
        <Button type="submit" variant="brand" className="h-12 w-full rounded-xl text-[12.5px] font-extrabold">
          <Send data-icon="inline-start" aria-hidden="true" />
          ارسال دعوت نامه
        </Button>
      </ActionDock>
    </form>
  );
}
