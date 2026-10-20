import type { Club, ClubAdmission } from "@/lib/coach/coach-data";

export type ClubFormState = {
  name: string;
  phone: string;
  address: string;
  admission: ClubAdmission;
  disciplines: string[];
};

export type ClubFormUpdater = <K extends keyof ClubFormState>(field: K, value: ClubFormState[K]) => void;

export function emptyClubForm(): ClubFormState {
  return {
    name: "",
    phone: "",
    address: "",
    admission: "male",
    disciplines: ["کیوروگی", "پومسه"],
  };
}

export function clubToForm(club: Club): ClubFormState {
  return {
    name: club.name,
    phone: club.phone,
    address: club.address,
    admission: club.admission,
    disciplines: club.disciplines,
  };
}
