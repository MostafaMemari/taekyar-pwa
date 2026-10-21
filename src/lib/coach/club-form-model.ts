import type { Club } from "@/lib/coach/coach-data";

export type ClubFormState = {
  name: string;
  address: string;
};

export type ClubFormUpdater = <K extends keyof ClubFormState>(field: K, value: ClubFormState[K]) => void;

export function emptyClubForm(): ClubFormState {
  return {
    name: "",
    address: "",
  };
}

export function clubToForm(club: Club): ClubFormState {
  return {
    name: club.name,
    address: club.address,
  };
}
