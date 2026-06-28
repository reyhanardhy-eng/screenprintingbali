import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://screenprintingbali.com"),
  title: "Screenprinting Bali: Design-led custom apparel printing in Bali",
  description:
    "A design-led screen printing and garment studio in Bali. In-house production for brand drops, small runs, and one-off custom prints. Eight years of design, made on the island.",
  openGraph: {
    title: "Screenprinting Bali: Print your brand in Bali",
    description:
      "Design-led screen printing & garment studio. In-house production, drops from 1 piece.",
    url: "https://screenprintingbali.com",
    siteName: "Screenprinting Bali",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/images/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon_16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/images/favicon_180.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
