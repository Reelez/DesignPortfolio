/**
 * The black "let's create something iconic" CTA/contact block — used as the
 * final section of the landing page and, standalone, as the /contact page.
 * Not wired to a backend endpoint (contact form submission is out of scope,
 * same as the previous /contact implementation).
 */
export default function ContactSection({
  contactEmail,
  footerVideo,
}: {
  contactEmail: string;
  footerVideo?: string | null;
}) {
  return (
    <section id="contact" className="relative bg-black text-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-16">
          <h2 className="font-anton mb-8 text-5xl leading-[0.9] md:text-7xl">
            LET&apos;S CREATE
            <br />
            SOMETHING ICONIC.
          </h2>
          <p className="mb-12 max-w-sm text-xs text-gray-400">
            I&apos;d love to hear your story and learn more about your project. I am
            booking 2024 and 2025 dates available.
            <br />
            Fill out the form below or email me directly at:
            <br />
            <a
              className="border-b border-white text-white transition-opacity hover:opacity-70"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail.toUpperCase()}
            </a>
          </p>
          <form className="w-full max-w-md space-y-8">
            {[
              { id: "name", label: "FIRST AND LAST NAME *", type: "text" },
              { id: "email", label: "EMAIL ADDRESS *", type: "email" },
              { id: "phone", label: "PHONE NUMBER (OPTIONAL)", type: "text" },
              { id: "date", label: "WEDDING DATE *", type: "text" },
              { id: "venue", label: "WEDDING VENUE *", type: "text" },
            ].map((field) => (
              <div key={field.id} className="relative">
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.label}
                  className="peer block w-full border-0 border-b border-gray-600 bg-transparent px-0 py-2 text-sm text-white placeholder-transparent focus:border-white focus:ring-0"
                />
                <label
                  htmlFor={field.id}
                  className="absolute -top-3.5 left-0 text-[10px] uppercase tracking-widest text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-gray-500"
                >
                  {field.label}
                </label>
              </div>
            ))}
            <div className="relative">
              <textarea
                id="project"
                rows={1}
                placeholder="TELL ME ABOUT YOUR PROJECT *"
                className="peer block w-full resize-none border-0 border-b border-gray-600 bg-transparent px-0 py-2 text-sm text-white placeholder-transparent focus:border-white focus:ring-0"
              />
              <label
                htmlFor="project"
                className="absolute -top-3.5 left-0 text-[10px] uppercase tracking-widest text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-gray-500"
              >
                TELL ME ABOUT YOUR PROJECT *
              </label>
            </div>
            <button
              type="submit"
              className="mt-8 w-auto border border-white px-8 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-white hover:text-black"
            >
              SEND INQUIRY →
            </button>
          </form>
        </div>
        {footerVideo ? (
          <div className="flex items-center justify-center bg-white p-8 md:p-16">
            <video
              className="h-auto w-full max-w-lg shadow-2xl"
              src={footerVideo}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-neutral-950 p-8 md:p-16">
            <div className="flex aspect-square w-full max-w-lg items-center justify-center border border-white/20 bg-neutral-900 text-xs tracking-widest text-white/40 uppercase">
              Coming soon
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
