import { authRequest } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type BeltInput = { name: string; level: number; durationMonth: number };

export function saveBelt(id: string | null, input: BeltInput): Promise<unknown> {
  return id ? authRequest(`belt/${id}`, { method: "patch", json: input }) : authRequest("belt", { method: "post", json: input });
}

export function deleteBelt(id: string): Promise<unknown> {
  return authRequest(`belt/${id}`, { method: "delete" });
}

export type AgeCategoryInput = { name: string; startDate: string; endDate: string };

export function saveAgeCategory(id: string | null, input: AgeCategoryInput): Promise<unknown> {
  return id
    ? authRequest(`age-category/${id}`, { method: "patch", json: input })
    : authRequest("age-category", { method: "post", json: input });
}

export function deleteAgeCategory(id: string): Promise<unknown> {
  return authRequest(`age-category/${id}`, { method: "delete" });
}

export type BeltExamInput = {
  name: string;
  examNumber: number;
  genders: Gender[];
  eventPlaces: string[];
  registerDate: string;
  eventDate: string;
  beltIds: string[];
};

export function saveBeltExam(id: string | null, input: BeltExamInput): Promise<unknown> {
  return id ? authRequest(`belt-exam/${id}`, { method: "patch", json: input }) : authRequest("belt-exam", { method: "post", json: input });
}

export function deleteBeltExam(id: string): Promise<unknown> {
  return authRequest(`belt-exam/${id}`, { method: "delete" });
}
