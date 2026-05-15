import { t } from "@/data/messages";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-6 px-6 pt-8 pb-8 md:gap-8 md:pt-12 md:pb-12 lg:grid-cols-2 lg:gap-10">
      <div>
        <h1 className="max-w-xl text-[2.45rem] font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl">
          {t.home.heroTitleLine1}
          <br />
          {t.home.heroTitleLine2}{" "}
          <span className="text-[#F28C6F]">
            {t.home.heroTitleHighlight}
          </span>
        </h1>

        <p className="mt-4 max-w-lg text-base leading-7 text-gray-600 md:mt-5 md:text-lg">
          {t.home.heroDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 md:mt-8 md:gap-4">
          <a
            href="#popular"
            className="rounded-xl bg-[#F28C6F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:px-6 md:py-3"
          >
            {t.home.exploreTools}
          </a>

          <a
            href="#all-tools"
            className="rounded-xl border border-[#F4C8BA] bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-[#FFF4EF] md:px-6 md:py-3"
          >
            {t.home.viewAllTools}
          </a>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full bg-[#FFF0EA] blur-3xl md:h-80 md:w-80" />

        <div className="relative w-full max-w-lg">
          <img
            src="/brand/hero-peachtools.webp.webp"
            alt="Peach Lab design tools illustration"
            className="h-auto w-full object-contain"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 58%, rgba(0,0,0,0.85) 70%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse at center, black 58%, rgba(0,0,0,0.85) 70%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}