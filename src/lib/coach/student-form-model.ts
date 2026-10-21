import type { Gender } from "@/lib/coach/coach-data";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import type { StudentBeltKey } from "@/lib/student-belts";

export type StudentFormState = {
  fullName: string;
  nationalCode: string;
  gender: Gender;
  birthDate: string;
  fatherName: string;
  phone: string;
  landline: string;
  province: string;
  belt: StudentBeltKey | "";
  beltDate: string;
  height: string;
  weight: string;
  membershipYear: string;
  insuranceDate: string;
  expireImageDate: string;
};

export type StudentFormUpdater = <K extends keyof StudentFormState>(field: K, value: StudentFormState[K]) => void;

export function emptyStudentForm(): StudentFormState {
  return {
    fullName: "",
    nationalCode: "",
    gender: "MALE",
    birthDate: "",
    fatherName: "",
    phone: "",
    landline: "",
    province: "",
    belt: "",
    beltDate: "",
    height: "",
    weight: "",
    membershipYear: "",
    insuranceDate: "",
    expireImageDate: "",
  };
}

export function studentToForm(profile: StudentProfile): StudentFormState {
  return {
    fullName: profile.name,
    nationalCode: profile.nationalCode,
    gender: profile.gender,
    birthDate: profile.birthDate,
    fatherName: profile.fatherName,
    phone: profile.phone,
    landline: profile.landline,
    province: profile.province,
    belt: profile.belt,
    beltDate: profile.beltDate,
    height: profile.height,
    weight: profile.weight,
    membershipYear: profile.membershipYear,
    insuranceDate: profile.insuranceDate ?? "",
    expireImageDate: profile.expireImageDate,
  };
}
