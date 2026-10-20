import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { THEME_INIT_SOURCE } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "تک یار — سامانه مدیریت باشگاه تکواندو",
    template: "%s — تک یار",
  },
  description: "همراهِ مربیان و هنرجویان تکواندو — از ثبت نام و حضور و غیاب تا پایش کمربندها و آموزش پومسه.",
  applicationName: "تک یار",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ce004f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-full antialiased">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static constant that restores theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SOURCE }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
