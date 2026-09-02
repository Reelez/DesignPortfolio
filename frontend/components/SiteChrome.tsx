"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import MenuOverlay from "@/components/MenuOverlay";

/**
 * The landing page ("/") and /contact ship their own header baked into the
 * page (black brutalist ContactSection + MenuOverlay), so the global chrome
 * would duplicate that. Portfolio routes get the black/white brutalist light
 * header. Every other route (e.g. /about) ships with no header at all.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/contact") return <>{children}</>;

  if (pathname.startsWith("/portfolio")) {
    return (
      <>
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black bg-white px-6 py-4 sm:px-10">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/signature-black.png" alt="Julian Jeffreys" className="h-8 w-auto" />
          </Link>
          <MenuOverlay variant="light" />
        </header>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
