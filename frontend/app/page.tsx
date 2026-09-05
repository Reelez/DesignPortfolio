import Link from "next/link";
import { getProjects } from "@/lib/api/projects";
import { getSiteSettings } from "@/lib/api/site";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import ContactSection from "@/components/ContactSection";
import MenuOverlay from "@/components/MenuOverlay";
import HomeImageGrid from "@/components/HomeImageGrid";

function ViewMoreButton({
  category,
  variant = "dark",
}: {
  category: string;
  variant?: "dark" | "light";
}) {
  const base =
    "group mt-10 inline-flex items-center gap-2 border px-8 py-3 text-xs font-medium tracking-widest uppercase transition-colors duration-300";
  const styles =
    variant === "dark"
      ? "border-white text-white hover:bg-white hover:text-black"
      : "border-black text-black hover:bg-black hover:text-white";

  return (
    <Link href={`/portfolio?category=${category}`} className={`${base} ${styles}`}>
      View More
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );
}

export default async function Home() {
  const [allProjects, site] = await Promise.all([getProjects(), getSiteSettings()]);
  const projects = allProjects.results;

  const bySlug = (slug: string) => projects.filter((p) => p.category?.slug === slug);
  const murals = bySlug("murals");
  const fineArt = bySlug("fine-art");
  const graphicDesign = bySlug("graphic-design");
  const webDesign = bySlug("web-design");
  const productDesign = bySlug("product-design");
  const brand = bySlug("brand-design");

  const buildBrandImage = brand[0]?.cover_image ?? projects[0]?.cover_image ?? null;

  // Static local images for the landing-page section previews (see
  // /public/homepage).
  const muralHomepageImages = [
    "/homepage/murals/dear-dads-mural.webp",
    "/homepage/murals/japanese-restaurant-2.webp",
    "/homepage/murals/mural-3.webp",
  ];
  const fineArtHomepageImages = [
    "/homepage/fine-art/fine-art-1.webp",
    "/homepage/fine-art/fine-art-2.webp",
    "/homepage/fine-art/fine-art-3.webp",
  ];
  const graphicDesignHomepageImages = [
    "/homepage/graphic-design/graphic-design-home-page.webp",
    "/homepage/graphic-design/holina-home-page.webp",
    "/homepage/graphic-design/oasis-home-page.webp",
  ];
  const webDesignHomepageImages = [
    "/homepage/web-design/web-design-1.webp",
    "/homepage/web-design/web-design-2.webp",
    "/homepage/web-design/web-design-3.webp",
  ];
  const productDesignHomepageImages = [
    "/homepage/product-design/product-design-home-page.webp",
    "/homepage/product-design/product-design-home-page-2.webp",
    "/homepage/product-design/product-design-home-page-3.webp",
  ];

  const contactEmail = site.contact_email || "HELLO@JULIANJEFFREYS.COM";

  return (
    <div className="bg-white text-black antialiased">
      {/* BEGIN: Hero Section */}
      <section className="relative flex h-[170dvh] flex-col md:h-dvh md:flex-row">
        <div className="relative order-2 w-full flex-1 bg-black md:order-1 md:w-1/2 md:flex-none">
          <video
            className="h-full w-full object-cover"
            src="/homepage/mural-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className="relative order-1 flex h-[38dvh] w-full flex-col bg-black p-6 text-white md:order-2 md:h-auto md:w-1/2 md:p-16">
          <div className="flex items-start justify-between">
            <a href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/signature-white.png"
                alt="Julian Jeffreys"
                className="h-7 w-auto md:h-9"
              />
            </a>
            <MenuOverlay variant="dark" />
          </div>
          <div className="flex flex-1 flex-col justify-end pb-0 text-right md:justify-center">
            <h2 className="font-anton flex flex-col gap-1 text-3xl leading-none sm:text-4xl md:gap-2 md:text-7xl lg:text-8xl">
              <span>MURALS</span>
              <span>FINE ART</span>
              <span>WEB DESIGN</span>
              <span>BRAND DESIGN</span>
              <span>GRAPHIC DESIGN</span>
            </h2>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Intro Section */}
      <section className="relative mx-auto max-w-7xl border-b border-black px-8 py-24 md:px-16">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div>
            <p className="font-helvetica mb-12 hidden text-xs tracking-widest uppercase md:block">
              Visual art, murals, and design built around one idea:
              <br />
              every brand deserves a world of its own.
            </p>
            <h2 className="font-anton text-6xl leading-[0.9] md:text-8xl">
              ART MADE TO
              <br />
              TRANSFORM
              <br />
              SPACES
            </h2>
          </div>
          <div className="pt-12">
            <p className="font-helvetica mb-12 border-b border-black pb-4 text-xs font-normal tracking-widest uppercase">
              BASED IN NORTH CAROLINA, AVAILABLE WORLDWIDE
            </p>
            <div className="font-helvetica max-w-md space-y-6 text-sm leading-relaxed">
              <p>
                I&apos;m Julian Jeffreys, a self-taught visual artist, designer, and
                muralist creating work that gives brands and spaces a distinct point of
                view. For more than a decade, I&apos;ve worked across murals, fine art,
                graphic design, and brand identity, approaching each project through a
                different lens.
              </p>
              <p>
                I&apos;m especially drawn to projects where the story is still being
                written, new businesses, new spaces, and new identities. I work closely
                with clients to understand not just what they want something to look
                like, but how they want it to feel. From there, I build a visual
                language around that feeling, sometimes expanding on existing story,
                and sometimes creating one entirely from scratch.
              </p>
              <a
                href="#work"
                className="mt-8 inline-block border-b border-black pb-1 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-70"
              >
                VIEW WORK →
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* END: Intro Section */}

      {/* BEGIN: Murals Section */}
      <section id="work" className="relative bg-black text-white">
        <div className="mx-auto max-w-7xl px-8 py-24 md:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-white pb-4 md:flex-row md:items-end md:gap-6">
            <h2 className="font-anton text-6xl md:text-8xl">MURALS</h2>
            <p className="font-helvetica max-w-md text-[13px] font-normal text-gray-400 md:mb-2">
              Large-scale works that transform walls into immersive brand and community
              experiences.
            </p>
          </div>
          <HomeImageGrid
            images={muralHomepageImages}
            alts={murals.map((p, i) => p?.title ?? `Mural artwork ${i + 1}`)}
            tileClassName="block w-full overflow-hidden bg-gray-900"
            imgClassName="h-auto w-full"
          />
          <ViewMoreButton category="murals" variant="dark" />
        </div>
      </section>
      {/* END: Murals Section */}

      {/* BEGIN: Fine Art Section */}
      <section className="relative border-b border-black bg-white text-black">
        <div className="mx-auto max-w-7xl px-8 py-24 md:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-black pb-4 md:flex-row md:items-end md:gap-6">
            <h2 className="font-anton text-6xl md:text-8xl">FINE ART</h2>
            <p className="font-helvetica max-w-md text-[13px] font-normal text-gray-500 md:mb-2">
              Original pieces exploring color, texture, and emotion across mixed media.
            </p>
          </div>
          <HomeImageGrid
            images={fineArtHomepageImages}
            alts={fineArt.map((p, i) => p?.title ?? `Fine art piece ${i + 1}`)}
            tileClassName="block w-full overflow-hidden bg-gray-100"
            imgClassName="h-auto w-full"
          />
          <ViewMoreButton category="fine-art" variant="light" />
        </div>
      </section>
      {/* END: Fine Art Section */}

      {/* BEGIN: Graphic Design Section */}
      <section className="relative border-b border-white bg-black text-white">
        <div className="mx-auto max-w-7xl px-8 py-24 md:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-white pb-4 md:flex-row md:items-end md:gap-6">
            <h2 className="font-anton text-6xl md:text-8xl">GRAPHIC DESIGN</h2>
            <p className="font-helvetica max-w-md text-[13px] font-normal text-gray-400 md:mb-2">
              Visual systems and print work built to communicate with clarity and edge.
            </p>
          </div>
          <HomeImageGrid
            images={graphicDesignHomepageImages}
            alts={graphicDesign.map((p, i) => p?.title ?? `Graphic design work ${i + 1}`)}
            tileClassName="block w-full overflow-hidden bg-gray-900"
            imgClassName="h-auto w-full"
          />
          <ViewMoreButton category="graphic-design" variant="dark" />
        </div>
      </section>
      {/* END: Graphic Design Section */}

      {/* BEGIN: Product Design Section */}
      <section className="relative border-b border-black bg-white text-black">
        <div className="mx-auto max-w-7xl px-8 py-24 md:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-black pb-4 md:flex-row md:items-end md:gap-6">
            <h2 className="font-anton text-6xl md:text-8xl">PRODUCT DESIGN</h2>
            <p className="font-helvetica max-w-md text-[13px] font-normal text-gray-500 md:mb-2">
              Physical and packaged goods designed with the same attention to
              form and detail.
            </p>
          </div>
          <HomeImageGrid
            images={productDesignHomepageImages}
            alts={productDesign.map((p, i) => p?.title ?? `Product design work ${i + 1}`)}
            tileClassName="block w-full overflow-hidden bg-gray-100"
            imgClassName="h-auto w-full"
          />
          <ViewMoreButton category="product-design" variant="light" />
        </div>
      </section>
      {/* END: Product Design Section */}

      {/* BEGIN: Web Design Section */}
      <section className="relative border-b border-white bg-black text-white">
        <div className="mx-auto max-w-[100rem] px-8 py-24 md:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-white pb-4 md:flex-row md:items-end md:gap-6">
            <h2 className="font-anton text-6xl md:text-8xl">WEB DESIGN</h2>
            <p className="font-helvetica max-w-md text-[13px] font-normal text-gray-400 md:mb-2">
              Digital experiences designed with the same eye for craft and
              storytelling as the physical work.
            </p>
          </div>
          <HomeImageGrid
            images={webDesignHomepageImages}
            alts={webDesign.map((p, i) => p?.title ?? `Web design work ${i + 1}`)}
            tileClassName="aspect-[4/3] flex w-full items-center justify-center overflow-hidden bg-gray-900"
            imgClassName="h-full w-full object-contain"
          />
          <ViewMoreButton category="web-design" variant="dark" />
        </div>
      </section>
      {/* END: Web Design Section */}

      {/* BEGIN: Build Your Brand Section */}
      <section className="relative border-b border-black bg-[#F9F9F9] text-black">
        <div className="mx-auto max-w-7xl px-8 pt-24 pb-12 md:px-16">
          <p className="mb-16 border-b border-black pb-4 text-xs tracking-widest uppercase">
            Art that elevates. Design that connects.
          </p>
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="font-anton mb-8 text-5xl leading-[0.9] md:text-7xl">
                LET ME BUILD
                <br />
                YOUR BRAND
                <br />
                WITH MY ARTWORK.
              </h2>
              <p className="mb-8 max-w-sm text-sm">
                From murals that transform spaces to visuals that bring brands to life,
                I create custom artwork and design that tell your story, set you apart,
                and leave a lasting impression.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center border-b border-black pb-1 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-70"
              >
                START A PROJECT →
              </a>
            </div>
            <div className="relative">
              {buildBrandImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Artist workspace with various prints and tools"
                  className="img-loading h-auto w-full shadow-xl"
                  src={cloudinaryOptimize(buildBrandImage, 800)}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="border-t border-black bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-8 text-xs md:flex-row md:px-16">
            <div className="font-medium tracking-widest uppercase">WHAT I CREATE —</div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <span className="block font-bold">MURALS</span>
                  <span className="hidden text-gray-500 md:block">
                    Large scale artworks that
                    <br />
                    transform spaces.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <span className="block font-bold">FINE ART</span>
                  <span className="hidden text-gray-500 md:block">
                    Original pieces that
                    <br />
                    express emotion.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <span className="block font-bold">GRAPHIC DESIGN</span>
                  <span className="hidden text-gray-500 md:block">
                    Visual identities that
                    <br />
                    communicate.
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right font-medium leading-tight uppercase">
              EVERY BRAND
              <br />
              HAS A STORY.
              <br />
              LET&apos;S MAKE YOURS
              <br />
              UNFORGETTABLE.
            </div>
          </div>
        </div>
      </section>
      {/* END: Build Your Brand Section */}

      {/* BEGIN: Footer Contact Section */}
      <ContactSection contactEmail={contactEmail} footerVideo="/homepage/mural-hero.mp4" />
      {/* END: Footer Contact Section */}
    </div>
  );
}
