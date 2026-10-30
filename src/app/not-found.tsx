import { NotFoundScreen } from "@/components/shared/not-found-screen";

export default function NotFound() {
  return (
    <main className="app-frame flex items-center justify-center px-5">
      <NotFoundScreen
        className="w-full"
        title="صفحه پیدا نشد"
        description="آدرسی که باز کرده اید در تک یار وجود ندارد. ممکن است نشانی عوض شده یا پیوند ناقص باشد."
        backHref="/"
        backLabel="بازگشت به خانه"
      />
    </main>
  );
}
