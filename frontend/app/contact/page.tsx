import { getSiteSettings } from "@/lib/api/site";
import ContactSection from "@/components/ContactSection";
import MenuOverlay from "@/components/MenuOverlay";

export default async function ContactPage() {
  const site = await getSiteSettings();
  const contactEmail = site.contact_email || "HELLO@JULIANJEFFREYS.COM";

  return (
    <div className="relative bg-black text-white">
      <div className="absolute top-8 left-8 right-8 z-10 flex items-start justify-between">
        <h1 className="text-xl font-medium tracking-tight">Julian Jeffreys</h1>
        <MenuOverlay variant="dark" />
      </div>
      <ContactSection contactEmail={contactEmail} />
    </div>
  );
}
