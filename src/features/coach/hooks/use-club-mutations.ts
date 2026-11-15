import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import {
  addStudentToClub,
  type ClubInput,
  type ClubRecord,
  changeClubMemberStatus,
  createClub,
  deleteClub,
  removeStudentFromClub,
  updateClub,
} from "@/features/coach/lib/club-api";
import { revalidateResource } from "@/lib/api/swr";

// Any club write can change the list, a detail record and the member counts, so the whole club branch is revalidated.
const revalidateClubs = () => mutate((key) => Array.isArray(key) && key[0] === "club");

export function useAddClubStudent() {
  return useSWRMutation(
    ["club", "members", "add"] as const,
    async (_key: unknown, { arg }: { arg: { clubId: string; studentId: string } }) => {
      await addStudentToClub(arg.clubId, arg.studentId);
      await revalidateResource("club");
    },
  );
}

// Arg-carried club id, so one hook instance serves every membership row of a screen.
export function useSetClubMemberStatus() {
  return useSWRMutation(
    ["club", "members", "status-set"] as const,
    async (_key: unknown, { arg }: { arg: { clubId: string; studentId: string; isActive: boolean } }) => {
      await changeClubMemberStatus(arg.clubId, arg.studentId, arg.isActive);
      await revalidateResource("club");
    },
  );
}

export function useRemoveClubStudent() {
  return useSWRMutation(
    ["club", "members", "remove"] as const,
    async (_key: unknown, { arg }: { arg: { clubId: string; studentId: string } }) => {
      await removeStudentFromClub(arg.clubId, arg.studentId);
      await revalidateResource("club");
      // The membership cleanup also removes the student from this club's classes.
      await revalidateResource("session");
    },
  );
}

export function useSaveClub(clubId?: string) {
  return useSWRMutation(
    clubId ? (["club", "update", clubId] as const) : (["club", "create"] as const),
    async (_key: unknown, { arg }: { arg: ClubInput }) => {
      const club = clubId ? await updateClub(clubId, arg) : await createClub(arg);
      await revalidateClubs();
      return club;
    },
  );
}

export function useChangeClubMemberStatus(clubId: string) {
  return useSWRMutation(
    ["club", "members", "status", clubId] as const,
    async (_key: unknown, { arg }: { arg: { studentId: string; isActive: boolean } }) => {
      await changeClubMemberStatus(clubId, arg.studentId, arg.isActive);
      await revalidateResource("club");
    },
  );
}

export function useDeleteClub() {
  return useSWRMutation(["club", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteClub(arg);

    // The club's sessions, attendance and fee history are gone with it. Clear those caches wholesale,
    // cut the club from the cached list (so no per-id count fetch 404s on the next screen), and refresh
    // the students whose fee status rode on this club.
    await mutate((key) => Array.isArray(key) && (key[0] === "session" || key[0] === "attendance"), undefined, {
      revalidate: false,
    });
    await mutate((key) => Array.isArray(key) && key[0] === "club" && key.includes(arg), undefined, { revalidate: false });
    await mutate(
      (key) => Array.isArray(key) && key[0] === "club" && key[1] === "list",
      (current: { clubs: ClubRecord[] } | undefined) =>
        current ? { ...current, clubs: current.clubs.filter((club) => club.id !== arg) } : current,
      { revalidate: true },
    );
    await revalidateResource("student");
  });
}
