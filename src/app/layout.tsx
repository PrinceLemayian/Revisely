import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const siteTitle = "Revisely | Find it. Learn it. Ace it.";
const siteDescription =
  "Find the right notes, past papers, CATs, and assignments for your unit in seconds, then ask a grounded AI assistant for a hand.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: siteTitle,
    template: "%s | Revisely"
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Revisely",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
