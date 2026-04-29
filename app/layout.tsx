import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "ARIUM Workspace",
  description: "아리움 브랜딩 팀 전용 워크스페이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
