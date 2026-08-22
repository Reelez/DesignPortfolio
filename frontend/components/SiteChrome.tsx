"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MenuOverlay from "@/components/MenuOverlay";

/**
 * The landing page ("/") and /contact ship their own header baked into the
 * page (black brutalist ContactSection + MenuOverlay), so the global
 * Nav/Footer would duplicate that chrome. Portfolio routes use the same
 * black/white brutalist system as the landing page, so they get a matching
 * light header instead of the cream-themed Nav used everywhere else.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/contact") return <>{children}</>;

  if (pathname.startsWith("/portfolio")) {
    return (
      <>
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black bg-white px-6 py-4 sm:px-10">
          <Link href="/" className="font-anton text-lg">
            Julian Jeffreys
          </Link>
          <MenuOverlay variant="light" />
        </header>
        {children}
      </>
    );
  }

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
