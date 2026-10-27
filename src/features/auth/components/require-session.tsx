"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getSession, HOME_BY_ROLE, type SessionRole } from "@/features/auth/session";

export function RequireSession({ forRole, children }: { forRole?: SessionRole; children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    if (forRole && session.role !== forRole) {
      router.replace(HOME_BY_ROLE[session.role]);
      return;
    }

    setAllowed(true);
  }, [router, forRole]);

  if (!allowed) return null;
  return children;
}
