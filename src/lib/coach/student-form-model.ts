import type { Gender } from "@/lib/coach/coach-data";
import type { StudentProfile } from "@/lib/coach/student-profile-data";

export type StudentFormState = {
  fullName: string;
  nationalCode: string;
  gender: Gender;
  birthDate: string;
  fatherName: string;
  phone: string;
  landline: string;
  province: string;
  belt: string;
  beltDate: string;
  ageClass: string;
  weightClass: string;
  height: string;
  weight: string;
  membershipYear: string;
  insuranceDate: string;
  imageExpireDate: string;
  trainingDays: string[];
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
    ageClass: "",
    weightClass: "",
    height: "",
    weight: "",
    membershipYear: "",
    insuranceDate: "",
    imageExpireDate: "",
    trainingDays: [],
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
    belt: profile.poom ? `poom-${profile.poom}` : profile.dan ? `dan-${profile.dan}` : profile.belt,
    beltDate: profile.beltDate,
    ageClass: profile.ageClass,
    weightClass: profile.weightClass,
    height: profile.height,
    weight: profile.weight,
    membershipYear: profile.membershipYear,
    insuranceDate: profile.insuranceDate ?? "",
    imageExpireDate: profile.imageExpireDate,
    trainingDays: profile.trainingDays,
  };
}
