import { SessionReportView } from "@/features/coach/components/sessions/session-report-view";
import { todayJalali, toGregorianDate } from "@/lib/jalali";

export const metadata = { title: "گزارش جلسه" };

export default async function SessionReportPage({ params, searchParams }: PageProps<"/coach/sessions/[id]/report">) {
  const { id } = await params;
  const query = await searchParams;

  const requested = typeof query.date === "string" ? query.date : "";
  const date = requested || toGregorianDate(todayJalali()) || "";

  return <SessionReportView sessionId={id} initialDate={date} />;
}
