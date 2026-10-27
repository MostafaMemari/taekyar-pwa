"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toStudentSignupData } from "@/features/auth/api";
import { StudentSignupStepBelt } from "@/features/auth/forms/student-signup-step-belt";
import { StudentSignupStepDocuments } from "@/features/auth/forms/student-signup-step-documents";
import { StudentSignupStepOne } from "@/features/auth/forms/student-signup-step-one";
import { readSignupDraft, savePendingSignup, saveSignupDraft } from "@/features/auth/pending-signup";
import { type StudentSignupForm, studentSignupSchema } from "@/features/auth/schemas";

const defaultValues: StudentSignupForm = {
  fullName: "",
  nationalCode: "",
  gender: "MALE",
  province: "",
  birthDate: "",
  belt: "",
  beltDate: "",
  insuranceDate: "",
  weight: "",
  height: "",
};

export function StudentSignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<StudentSignupForm>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues,
  });

  const goTo = (next: number) => {
    setStep(next);
    saveSignupDraft({ kind: "student", step: next, values: form.getValues() });
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const draft = readSignupDraft();
    if (draft?.kind !== "student") return;
    form.reset(draft.values);
    setStep(draft.step);
  }, [form]);

  const nextFromStepOne = async () => {
    const valid = await form.trigger(["fullName", "nationalCode", "gender", "province", "birthDate"]);
    // zodResolver validates the whole object, so drop errors from the later steps.
    form.clearErrors(["belt", "beltDate", "insuranceDate", "weight", "height"]);
    if (valid) goTo(1);
  };

  const nextFromBelt = async () => {
    if (await form.trigger(["belt", "beltDate"])) goTo(2);
  };

  const finish = (values: StudentSignupForm) => {
    saveSignupDraft({ kind: "student", step, values });
    savePendingSignup({ kind: "student", studentData: toStudentSignupData(values) });
  };

  const submit = form.handleSubmit((values) => {
    finish(values);
    router.push("/signup/mobile?role=student");
  });

  if (step === 2) {
    return <StudentSignupStepDocuments form={form} onBack={() => goTo(1)} onSubmit={submit} onSkip={() => finish(form.getValues())} />;
  }

  if (step === 1) {
    return <StudentSignupStepBelt form={form} onBack={() => goTo(0)} onNext={nextFromBelt} />;
  }

  return <StudentSignupStepOne form={form} onNext={nextFromStepOne} />;
}
