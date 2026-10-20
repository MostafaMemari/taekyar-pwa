"use client";

import { CircleAlert, ClipboardList, Phone, Plus, Send, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { INVITATION_STATUS_META, INVITATIONS } from "@/components/coach/coach-data";
import { ActionDock, FormSection } from "@/components/coach/coach-form";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { PersonAvatar, SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { AuthField } from "@/components/shared/auth-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const FLOW_NOTES = [
  {
    icon: Send,
    tone: "text-info",
    text: "هنرجو پیامک دعوت را دریافت و با تایید آن، به فهرست شاگردان شما اضافه می شود.",
  },
  {
    icon: UserPlus,
    tone: "text-success",
    text: "اگر هنرجو حساب کاربری نداشته باشد، پروفایل او به صورت مستقیم برای شما ساخته می شود.",
  },
  {
    icon: CircleAlert,
    tone: "text-danger",
    text: "اگر هنرجو از قبل مربی دار باشد، دعوت نامه قابل ارسال نیست.",
  },
];

export function InviteForm() {
  const router = useRouter();
  const [phones, setPhones] = useState<string[]>(["09120987654", "09351234567", "09021112233"]);
  const [draft, setDraft] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const addPhone = () => {
    const phone = digitsOnly(draft, 11);
    if (!phone) return;

    setPhones((current) => (current.includes(phone) ? current : [...current, phone]));
    setDraft("");
    setAddOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/coach/invitations");
  };

  return (
    <>
      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormSection icon={Phone} title="شماره های تماس">
          <p className="-mt-2 text-start text-[11px] font-medium leading-5 text-ink-muted">
            شماره موبایل هنرجو را وارد و افزودن کنید؛ حداکثر ۱۰ شماره در هر ارسال.
          </p>

          <div className="flex flex-wrap gap-2">
            {phones.map((phone) => (
              <span
                key={phone}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pe-1.5 ps-3 text-[12px] font-bold text-accent-ink"
              >
                <span dir="ltr">{toPersianDigits(phone)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`حذف شماره ${toPersianDigits(phone)}`}
                  className="size-5 rounded-full text-brand-400 hover:bg-brand-100 hover:text-accent-ink"
                  onClick={() => setPhones((current) => current.filter((value) => value !== phone))}
                >
                  <X aria-hidden="true" />
                </Button>
              </span>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-dashed text-[12px] font-extrabold text-ink-muted"
            onClick={() => setAddOpen(true)}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            افزودن شماره
          </Button>
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
                  <PersonAvatar name={invitation.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold text-ink">{invitation.name}</p>
                    <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-subtle">
                      <span dir="ltr">{toPersianDigits(invitation.phone)}</span> · ارسال: {invitation.sentAt}
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
            ارسال دعوت نامه ها ({toPersianDigits(String(phones.length))} شماره)
          </Button>
        </ActionDock>
      </form>

      <SheetFrame open={addOpen} onOpenChange={setAddOpen} title="افزودن شماره تماس" description="افزودن شماره موبایل به فهرست دعوت">
        <AuthField label="شماره موبایل" htmlFor="invitePhone" hint="۱۱ رقم، بدون خط تیره">
          <Input
            id="invitePhone"
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
            maxLength={11}
            placeholder={toPersianDigits("09121234567")}
            value={toPersianDigits(draft)}
            onChange={(event) => setDraft(digitsOnly(event.target.value, 11))}
            className="h-12 rounded-xl px-4 text-center text-sm font-semibold tracking-widest"
          />
        </AuthField>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setAddOpen(false)}>
            انصراف
          </Button>
          <Button type="button" variant="brand" className="h-11 flex-[2] rounded-xl text-[12.5px] font-extrabold" onClick={addPhone}>
            افزودن شماره
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
