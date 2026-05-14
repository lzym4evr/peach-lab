import { t } from "@/data/messages";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-12 pb-12 lg:grid-cols-2">
      <div>
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {t.home.heroTitleLine1}
          <br />
          {t.home.heroTitleLine2}{" "}
          <span className="text-[#F28C6F]">
            {t.home.heroTitleHighlight}
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 md:text-lg">
          {t.home.heroDescription}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#popular"
            className="rounded-xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
          >
            {t.home.exploreTools}
          </a>

          <a
            href="#all-tools"
            className="rounded-xl border border-[#F4C8BA] bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#FFF4EF]"
          >
            {t.home.viewAllTools}
          </a>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute h-80 w-80 rounded-full bg-[#FFF0EA] blur-2xl" />

        <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#FFF7F3] shadow-sm">
          <img
            src="/brand/hero-peach-tools.webp"
            alt="Peach Lab design tools illustration"
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}