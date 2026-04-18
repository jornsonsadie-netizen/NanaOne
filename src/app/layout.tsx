import type { Metadata } from "next";
import "./globals.css";
import { initDatabase } from "@/lib/db/utils";

export const metadata: Metadata = {
  title: "NanaOne | Premium AI Gateway",
  description: "Next-generation AI gateway with individual API keys and daily credits.",
};

import { Providers } from "./providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize database on the first server-side render
  await initDatabase();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="grid-bg" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
