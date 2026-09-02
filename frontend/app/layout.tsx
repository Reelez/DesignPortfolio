import type { Metadata } from "next";
import { Playfair_Display, Inter, Anton } from "next/font/google";
import localFont from "next/font/local";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const helveticaNeue = localFont({
  variable: "--font-helvetica-neue",
  src: "../public/fonts/HelveticaNeue-Regular.ttf",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Murales, fine art, diseño gráfico y brand design.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${anton.variable} ${helveticaNeue.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
