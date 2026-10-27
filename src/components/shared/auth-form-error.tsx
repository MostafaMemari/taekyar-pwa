export function AuthFormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[11.5px] font-semibold text-destructive">
      {message}
    </p>
  );
}
