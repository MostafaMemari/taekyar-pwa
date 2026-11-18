"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ensureAccessToken } from "@/features/auth/api";
import { getSession, HOME_BY_ROLE, type SessionRole } from "@/features/auth/session";

export function RequireSession({ forRole, children }: { forRole?: SessionRole; children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    ensureAccessToken()
      .then(() => {
        if (!active) return;

        const role = getSession()?.role;
        if (forRole && role !== forRole) {
          router.replace(role ? HOME_BY_ROLE[role] : "/login");
          return;
        }

        setAllowed(true);
      })
      .catch(() => {
        if (active) router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router, forRole]);

  if (!allowed) return null;
  return children;
}
