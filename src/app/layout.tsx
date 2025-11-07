import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { HideDevPanel } from "@/components/hide-dev-panel";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lab Orders Lite",
  description: "Laboratory order management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            {children}
            <Toaster />
            <HideDevPanel />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
