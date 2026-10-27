"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getSession, HOME_BY_ROLE } from "@/features/auth/session";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(HOME_BY_ROLE[session.role]);
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) return null;
  return children;
}
