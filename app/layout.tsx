import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ideY - Build What's Worth Building",
  description: "Turn your startup idea into an actionable execution plan with AI",
  icons: {
    icon: "/idey.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased text-gray-900 bg-background`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
