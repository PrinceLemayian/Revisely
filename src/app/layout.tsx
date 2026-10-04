import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

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
    // suppressHydrationWarning: the ThemeProvider adds the 'dark' class on the
    // client after reading localStorage, which creates an intentional mismatch
    // with the server-rendered HTML. This attribute silences that one warning.
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f7faf9] dark:bg-dark-bg dark:text-dark-text">
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
