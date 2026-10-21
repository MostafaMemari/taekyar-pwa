"use client";

import { CalendarDays, Landmark, LayoutDashboard, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCoachFormRoute } from "@/lib/coach/coach-form-routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/coach", label: "داشبورد", icon: LayoutDashboard },
  { href: "/coach/students", label: "هنرجویان", icon: Users },
  { href: "/coach/clubs", label: "باشگاه ها", icon: Landmark },
  { href: "/coach/sessions", label: "کلاس ها", icon: CalendarDays },
  { href: "/coach/profile", label: "پروفایل", icon: User },
];

export function CoachTabBar() {
  const pathname = usePathname();

  if (isCoachFormRoute(pathname)) return null;

  return (
    <nav className="coach-tabbar" aria-label="ناوبری اصلی">
      {TABS.map((tab) => {
        const active =
          tab.href === "/coach"
            ? pathname === "/coach"
            : tab.href === "/coach/students"
              ? pathname.startsWith("/coach/students") || pathname.startsWith("/coach/invitations")
              : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn("coach-tab", active && "is-active")}
          >
            <span className="coach-tab-ico">
              <tab.icon aria-hidden="true" />
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
