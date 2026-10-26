import { notFound } from "next/navigation";
import { SessionReport } from "@/features/coach/components/sessions/session-report";
import { getSessionDetail } from "@/features/coach/lib/session-data";

export const metadata = { title: "گزارش جلسه" };

export default async function SessionReportPage({ params }: PageProps<"/coach/sessions/[id]/report">) {
  const { id } = await params;
  const detail = getSessionDetail(id);

  if (!detail) notFound();

  return <SessionReport detail={detail} />;
}
