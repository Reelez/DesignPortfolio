import { getSiteSettings } from "@/lib/api/site";
import ContactSection from "@/components/ContactSection";
import MenuOverlay from "@/components/MenuOverlay";

export default async function ContactPage() {
  const site = await getSiteSettings();
  const contactEmail = site.contact_email || "HELLO@JULIANJEFFREYS.COM";

  return (
    <div className="relative bg-black text-white">
      <div className="absolute top-8 left-8 right-8 z-10 flex items-start justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/signature-white.png" alt="Julian Jeffreys" className="h-6 w-auto" />
        <MenuOverlay variant="dark" />
      </div>
      <ContactSection contactEmail={contactEmail} />
    </div>
  );
}
