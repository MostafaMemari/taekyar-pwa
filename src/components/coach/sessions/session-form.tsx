"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormDock } from "@/components/coach/coach-form";
import { emptySessionForm, type SessionFormState, type SessionFormUpdater } from "@/lib/coach/session-form-model";
import { SessionInfoFields, SessionScheduleFields } from "./session-form-fields";

export function SessionForm({ mode, sessionId, initial }: { mode: "create" | "edit"; sessionId?: string; initial?: SessionFormState }) {
  const router = useRouter();
  const [form, setForm] = useState<SessionFormState>(() => initial ?? emptySessionForm());

  const update: SessionFormUpdater = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(sessionId ? `/coach/sessions/${sessionId}` : "/coach/sessions");
  };

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <SessionInfoFields form={form} onChange={update} />
      <SessionScheduleFields form={form} onChange={update} />

      <FormDock
        cancelHref={sessionId ? `/coach/sessions/${sessionId}` : "/coach/sessions"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ایجاد کلاس"}
      />
    </form>
  );
}
