import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Space Explorer | NASA Astronomy Picture of the Day",
  description:
    "Explore NASA’s Astronomy Picture of the Day archive by date, with immersive images, videos, and field notes.",
  openGraph: {
    title: "Space Explorer",
    description: "Explore the universe, one day at a time.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Space Explorer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Explorer",
    description: "Explore the universe, one day at a time.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
