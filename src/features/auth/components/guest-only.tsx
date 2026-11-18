"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { ensureAccessToken } from "@/features/auth/api";
import { clearSession, getSession, HOME_BY_ROLE, type SessionRole } from "@/features/auth/session";

const ROLES: readonly SessionRole[] = ["COACH", "STUDENT", "ADMIN"];

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || !ROLES.includes(session.role)) return;

    ensureAccessToken().catch(() => clearSession());

    router.replace(HOME_BY_ROLE[session.role]);
  }, [router]);

  return children;
}
