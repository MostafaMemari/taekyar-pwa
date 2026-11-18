"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { ensureAccessToken } from "@/features/auth/api";
import { getSession, HOME_BY_ROLE } from "@/features/auth/session";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // A visitor with no stored hint has never signed in: don't probe the refresh endpoint on every public screen.
    if (!getSession()) return;

    let active = true;

    ensureAccessToken()
      .then(() => {
        if (!active) return;

        const role = getSession()?.role;
        if (role) router.replace(HOME_BY_ROLE[role]);
      })
      .catch(() => {
        // No cookie means a real guest: keep rendering the public screen.
      });

    return () => {
      active = false;
    };
  }, [router]);

  return children;
}
