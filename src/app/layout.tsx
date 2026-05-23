import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Grad-Pictures.today | AI-Powered Graduation Photos",
    template: "%s | Grad-Pictures.today",
  },
  description:
    "Generate professional graduation and yearbook photos with AI. Affordable, fast, and high-quality alternatives to traditional photography.",
  keywords: [
    "graduation photos",
    "yearbook photos",
    "AI photos",
    "graduation portraits",
    "professional photos",
  ],
  authors: [{ name: "Grad-Pictures.today" }],
  creator: "Grad-Pictures.today",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://grad-pictures.today",
    siteName: "Grad-Pictures.today",
    title: "Grad-Pictures.today | AI-Powered Graduation Photos",
    description:
      "Generate professional graduation and yearbook photos with AI. Affordable, fast, and high-quality.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grad-Pictures.today | AI-Powered Graduation Photos",
    description:
      "Generate professional graduation and yearbook photos with AI. Affordable, fast, and high-quality.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://grad-pictures.today"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Grad-Pictures.today",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://grad-pictures.today",
    description:
      "AI-powered graduation and yearbook photo generation service",
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}