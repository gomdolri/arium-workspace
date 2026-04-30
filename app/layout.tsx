import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "ARIUM Workspace",
  description: "아리움 브랜딩 팀 전용 워크스페이스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ARIUM",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#FF6200",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#FF6200" />
      </head>
      <body className="min-h-full">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
