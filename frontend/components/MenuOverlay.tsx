"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MenuOverlay({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const barColor = variant === "dark" ? "bg-white" : "bg-black";
  const textColor = variant === "dark" ? "text-white" : "text-black";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open menu"
        className={`flex cursor-pointer flex-col items-center gap-2 ${textColor}`}
      >
        <div className="flex w-6 flex-col gap-1">
          <span className={`block h-0.5 w-full ${barColor}`} />
          <span className={`block h-0.5 w-full ${barColor}`} />
          <span className={`block h-0.5 w-full ${barColor}`} />
        </div>
        <span className="vertical-text mt-2 text-xs tracking-widest">MENU</span>
      </button>

      <div
        className={`fixed inset-0 z-50 flex flex-col justify-between bg-black p-8 text-white transition-transform duration-200 ease-out md:p-16 ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/signature-white.png" alt="Julian Jeffreys" className="h-6 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="relative flex h-6 w-6 cursor-pointer items-center justify-center"
          >
            <span className="absolute h-0.5 w-6 rotate-45 bg-white" />
            <span className="absolute h-0.5 w-6 -rotate-45 bg-white" />
          </button>
        </div>

        <nav className="font-anton flex flex-col items-end gap-4 text-right text-5xl leading-[0.9] uppercase md:text-8xl">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="transition-colors duration-200 hover:text-white/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-xs tracking-widest text-gray-500 uppercase">
          © 2024 Design Portfolio
        </div>
      </div>
    </>
  );
}
