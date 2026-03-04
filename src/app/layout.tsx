import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ReadingProgressProvider } from "@/contexts/ReadingProgressContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SavedNovelsProvider } from "@/contexts/SavedNovelsContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Litverse Reader",
  description: "Audio Light Novel Reader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-background text-foreground flex h-screen overflow-hidden`}>
        <ToastProvider>
          <SettingsProvider>
            <SavedNovelsProvider>
              <ReadingProgressProvider>
                <Sidebar />
                <main className="flex-1 overflow-hidden relative flex flex-col md:ml-72 transition-all duration-300">
                  {children}
                </main>
              </ReadingProgressProvider>
            </SavedNovelsProvider>
          </SettingsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
