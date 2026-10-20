import { ChevronLeft, GraduationCap, LogIn, User } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BeltGlyph, BeltWatermark, LogoMark } from "@/components/shared/taekyar-mark";
import { ThemeSwitch } from "@/components/shared/theme-switch";

export const metadata: Metadata = { title: "خوش آمدید" };

export default function WelcomePage() {
  return (
    <main className="app-frame mx-auto flex h-dvh w-full flex-col overflow-y-auto overflow-x-clip">
      <section className="welcome-hero flex min-h-0 flex-1 flex-col px-5 pb-3 pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <div className="relative flex items-center justify-between gap-2">
          <span className="hero-chip" style={{ background: "var(--surface)", color: "var(--ak-ink)", borderColor: "var(--ak-tint-line)" }}>
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-600" />
            </span>
            سامانه مدیریت باشگاه تکواندو
          </span>
          <ThemeSwitch />
        </div>

        <div className="relative mt-4 flex items-center justify-center gap-3">
          <LogoMark className="size-12 rounded-2xl" />
          <h1 className="text-[34px] font-extrabold leading-none tracking-tight text-ink">تک یار</h1>
        </div>

        <figure className="relative mx-auto mt-3 flex min-h-[120px] max-h-[340px] w-full max-w-[360px] flex-1 overflow-hidden rounded-[26px] border border-[var(--card-line)] shadow-[0_26px_50px_-24px_rgba(206,0,79,0.45)]">
          <Image
            src="/images/hero-welcome.jpg"
            alt="هنرجوی تکواندو در حال اجرای ضربهٔ پا"
            fill
            priority
            sizes="(max-width: 520px) 90vw, 360px"
            className="object-cover object-[50%_24%]"
          />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent"
            aria-hidden="true"
          />
          <figcaption className="meta-glass absolute start-3 top-3 py-1.5">
            <BeltGlyph />
            از کمربند سفید تا دان ۴
          </figcaption>
        </figure>
      </section>

      <section className="welcome-sheet mx-auto w-full">
        <h2 className="text-[17px] font-extrabold text-ink">شروع کنید</h2>

        <div className="mt-3 flex flex-col gap-2.5">
          <Link href="/signup/student" className="role-card role-card-hero">
            <span className="role-ico">
              <User className="size-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[15px] font-extrabold text-white">هنرجو هستم</b>
              <span className="role-sub">ثبت نام هنرجو — کمربند، بیمه و مشخصات</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-white/70" aria-hidden="true" />
            <BeltWatermark />
          </Link>

          <Link href="/signup/coach" className="role-card">
            <span className="role-ico role-ico-soft">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[14px] font-extrabold text-ink">مربی هستم</b>
              <span className="role-sub">ثبت نام مربی و ساخت باشگاه</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-ink-faint" aria-hidden="true" />
          </Link>

          <Link href="/login" className="role-card">
            <span className="role-ico role-ico-soft bg-surface-sunken text-ink-body">
              <LogIn className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[14px] font-extrabold text-ink">قبلاً ثبت نام کرده ام</b>
              <span className="role-sub">ورود با شماره موبایل و کد تایید</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-ink-faint" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
