"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

const OTP_LENGTH = 5;

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

export function OtpInput({ length = OTP_LENGTH, value, onChange, onComplete }: OtpInputProps) {
  return (
    <InputOTP
      maxLength={length}
      value={toPersianDigits(value)}
      onChange={(next) => onChange(digitsOnly(next, length))}
      onComplete={(next: string) => onComplete?.(digitsOnly(next, length))}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      textAlign="center"
      aria-label="کد تایید"
      containerClassName="justify-center"
    >
      <InputOTPGroup dir="ltr" className="gap-2">
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot
            // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional by definition
            key={index}
            index={index}
            className="size-12 rounded-xl border text-xl font-extrabold first:rounded-xl last:rounded-xl"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
