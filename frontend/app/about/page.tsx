import { getSiteSettings } from "@/lib/api/site";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import MenuOverlay from "@/components/MenuOverlay";

export default async function AboutPage() {
  const site = await getSiteSettings();

  const socialLinks = [
    { label: "Instagram", url: site.instagram_url },
    { label: "Behance", url: site.behance_url },
    { label: "LinkedIn", url: site.linkedin_url },
  ].filter((link) => link.url);

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="absolute top-8 left-8 right-8 z-10 flex items-start justify-between">
        <h1 className="font-anton text-xl">Julian Jeffreys</h1>
        <MenuOverlay variant="light" />
      </div>

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pt-32 pb-24 sm:px-10 sm:pt-40">
        <h2 className="font-anton text-5xl leading-[0.9] md:text-7xl">ABOUT</h2>

        <div className="flex flex-col gap-10 border-t border-black pt-10 sm:flex-row sm:items-start">
          {site.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryOptimize(site.profile_photo, 320)}
              alt="Profile photo"
              className="img-loading h-40 w-40 flex-shrink-0 object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div className="flex flex-col gap-6">
            {site.bio ? (
              <p className="max-w-xl whitespace-pre-line text-sm leading-relaxed">{site.bio}</p>
            ) : null}
            {socialLinks.length > 0 || site.contact_email ? (
              <ul className="flex flex-wrap gap-6 border-t border-black pt-6">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                {site.contact_email ? (
                  <li>
                    <a
                      href={`mailto:${site.contact_email}`}
                      className="text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-70"
                    >
                      {site.contact_email}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
