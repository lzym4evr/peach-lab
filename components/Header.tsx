"use client";

import { useState } from "react";
import { t } from "@/data/messages";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      label: t.home.navTools,
      href: "/#popular",
    },
    {
      label: t.home.navCategories,
      href: "/#categories",
    },
    {
      label: t.home.navAllTools,
      href: "/#all-tools",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#F1E5DF] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <img
            src="/brand/peachlab-logo.svg"
            alt="Peach Lab"
            className="h-10 w-auto md:h-10"
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <a
            href="/#popular"
            className="transition hover:text-[#F28C6F]"
          >
            {t.home.navTools}
          </a>

          <a
            href="/#categories"
            className="transition hover:text-[#F28C6F]"
          >
            {t.home.navCategories}
          </a>

          <a
            href="/#all-tools"
            className="rounded-full border border-[#F4C8BA] px-4 py-2 font-semibold text-[#E6765B] transition hover:bg-[#FFF4EF]"
          >
            {t.home.navAllTools}
          </a>
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-2xl text-[#111827] transition hover:bg-[#FFF7F3] md:hidden"
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#F1E5DF] bg-white/95 px-6 py-4 backdrop-blur md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-3">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={
                  index === navItems.length - 1
                    ? "rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-center text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    : "rounded-2xl px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-[#FFF7F3] hover:text-[#F28C6F]"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}