"use client";

import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { CoachSheet } from "@/components/coach/coach-band";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { StudentAttendancePanel } from "./student-attendance-panel";
import { StudentBand } from "./student-band";
import { StudentClubsPanel } from "./student-clubs-panel";
import { StudentDetailActions } from "./student-detail-actions";
import { StudentInfoPanel } from "./student-info-panel";

export function StudentDetail({ profile }: { profile: StudentProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <StudentBand
        profile={profile}
        backHref="/coach/students"
        meta={<span className="meta-glass">{profile.hasAccount ? "دارای حساب کاربری" : "بدون حساب کاربری"}</span>}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="عملیات بیشتر"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMenuOpen(true)}
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <Tabs defaultValue="info" className="gap-3">
          <TabsList className="grid h-10 w-full grid-cols-3">
            <TabsTrigger value="info" className="text-[12px]">
              اطلاعات
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-[12px]">
              حضور و غیاب
            </TabsTrigger>
            <TabsTrigger value="clubs" className="text-[12px]">
              باشگاه ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <StudentInfoPanel profile={profile} />
          </TabsContent>
          <TabsContent value="attendance">
            <StudentAttendancePanel profile={profile} />
          </TabsContent>
          <TabsContent value="clubs">
            <StudentClubsPanel profile={profile} />
          </TabsContent>
        </Tabs>

        <StudentDetailActions profile={profile} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      </CoachSheet>
    </main>
  );
}
