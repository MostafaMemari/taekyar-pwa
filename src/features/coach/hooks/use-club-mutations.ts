import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type ClubInput, changeClubMemberStatus, changeClubStatus, createClub, updateClub } from "@/features/coach/lib/club-api";

// Any club write can change the list, a detail record and the member counts, so the whole club branch is revalidated.
const revalidateClubs = () => mutate((key) => Array.isArray(key) && key[0] === "club");

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

export function useChangeClubStatus(clubId: string) {
  return useSWRMutation(["club", "status", clubId] as const, async (_key: unknown, { arg }: { arg: boolean }) => {
    const club = await changeClubStatus(clubId, arg);
    await revalidateClubs();
    return club;
  });
}

export function useChangeClubMemberStatus(clubId: string) {
  return useSWRMutation(
    ["club", "members", "status", clubId] as const,
    async (_key: unknown, { arg }: { arg: { studentId: string; isActive: boolean } }) => {
      await changeClubMemberStatus(clubId, arg.studentId, arg.isActive);
      await revalidateClubs();
    },
  );
}
