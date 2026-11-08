"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logoutSession } from "@/features/auth/api";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    await logoutSession();
    router.replace("/login");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={pending}
      onClick={onClick}
      className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12px] font-semibold text-destructive hover:bg-danger-soft hover:text-danger"
    >
      <LogOut aria-hidden="true" />
      <span>{pending ? "در حال خروج..." : "خروج از حساب"}</span>
    </Button>
  );
}
