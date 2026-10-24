import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { SessionProvider } from "@/hooks/useSession";
import { EventProvider } from "@/hooks/useEvent";
import { ToastProvider } from "@/hooks/useToast";
import { ThemeSync } from "@/components/layout/ThemeSync";
import "./globals.css";

// Self-hosted at build time, so the CSP stays `font-src 'self'` and no
// request ever leaves for a font CDN.
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EventGenie — plan any celebration",
  description:
    "Pick your occasion and plan it in one place: budget, checklist, timeline, guests, vendors, inspiration and an AI planning assistant.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Present so a future inline script can be nonced; the CSP itself is set in
  // src/proxy.ts.
  await headers();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>
            <EventProvider>
              <ThemeSync />
              {children}
            </EventProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
