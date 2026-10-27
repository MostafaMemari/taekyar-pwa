"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getSession, type SessionRole } from "@/features/auth/session";

const HOME: Record<SessionRole, string> = { COACH: "/coach", STUDENT: "/student" };

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
      router.replace(HOME[session.role]);
      return;
    }

    setAllowed(true);
  }, [router, forRole]);

  if (!allowed) return null;
  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(HOME[session.role]);
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) return null;
  return children;
}
