import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFCS - Fully Flexible Credit System",
  description: "University course registration system with flexible credit-based scheduling, real-time seat availability, and intelligent clash detection.",
  keywords: ["FFCS", "course registration", "timetable", "university", "credit system"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
