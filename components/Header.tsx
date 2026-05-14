import { t } from "@/data/messages";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1E5DF] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <img
            src="/brand/peachlab-logo.svg"
            alt="Peach Lab"
            className="h-11 w-auto md:h-10"
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <a href="/#popular" className="hover:text-[#F28C6F]">
            {t.home.navTools}
          </a>
          <a href="/#categories" className="hover:text-[#F28C6F]">
            {t.home.navCategories}
          </a>
          <a href="/#all-tools" className="hover:text-[#F28C6F]">
            {t.home.navAllTools}
          </a>
        </nav>

        <button className="text-2xl md:hidden">☰</button>
      </div>
    </header>
  );
}