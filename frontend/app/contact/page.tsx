import Link from "next/link";
import { getSiteSettings } from "@/lib/api/site";
import ContactSection from "@/components/ContactSection";
import MenuOverlay from "@/components/MenuOverlay";

export default async function ContactPage() {
  const site = await getSiteSettings();
  const contactEmail = site.contact_email || "HELLO@JULIANJEFFREYS.COM";

  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white">
      <div className="relative z-10 flex items-start justify-between p-8">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/signature-white.png" alt="Julian Jeffreys" className="h-6 w-auto" />
        </Link>
        <MenuOverlay variant="dark" />
      </div>
      <ContactSection contactEmail={contactEmail} />
    </div>
  );
}
