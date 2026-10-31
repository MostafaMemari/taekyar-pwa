import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { Gender, InvitationStatus } from "@/features/coach/lib/coach-data";

export type InvitationStudent = {
  id: string;
  fullName: string;
  nationalCode: string;
  gender: Gender;
  imageKey: string | null;
};

export type InvitationRecord = {
  id: string;
  studentId: string;
  nationalCode: string;
  status: InvitationStatus;
  respondedAt: string | null;
  createdAt: string;
  student: InvitationStudent;
};

export const INVITATIONS_PAGE_SIZE = 100;

export function fetchInvitations(): Promise<{ invitations: InvitationRecord[]; total: number }> {
  return authRequestWithMeta<InvitationRecord[]>(`student-coach-invitation/sent?page=1&take=${INVITATIONS_PAGE_SIZE}`).then(
    ({ data, pager }) => ({ invitations: data, total: pager?.total ?? data.length }),
  );
}

export function sendInvitation(nationalCode: string): Promise<void> {
  return authRequest<unknown>("student-coach-invitation", { method: "post", json: { nationalCode } }).then(() => undefined);
}
