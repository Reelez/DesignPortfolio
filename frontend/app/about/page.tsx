import { getSiteSettings } from "@/lib/api/site";

export default async function AboutPage() {
  const site = await getSiteSettings();

  const socialLinks = [
    { label: "Instagram", url: site.instagram_url },
    { label: "Behance", url: site.behance_url },
    { label: "LinkedIn", url: site.linkedin_url },
  ].filter((link) => link.url);

  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-col gap-2">
        <p className="tracking-label text-xs text-accent">About</p>
        <h1 className="font-display text-4xl">A little context</h1>
      </div>

      <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
        {site.profile_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.profile_photo}
            alt="Profile photo"
            className="h-40 w-40 flex-shrink-0 rounded-full bg-line object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-6">
          {site.bio ? (
            <p className="max-w-xl whitespace-pre-line text-lg leading-relaxed">{site.bio}</p>
          ) : null}
          {socialLinks.length > 0 || site.contact_email ? (
            <ul className="flex flex-wrap gap-6 border-t border-line pt-6">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tracking-label text-xs text-muted hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {site.contact_email ? (
                <li>
                  <a
                    href={`mailto:${site.contact_email}`}
                    className="tracking-label text-xs text-muted hover:text-accent"
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
  );
}
