import { t } from "@/data/messages";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-6 px-6 pt-8 pb-8 sm:gap-8 sm:pt-10 sm:pb-10 lg:grid-cols-2 lg:gap-10 lg:pt-12 lg:pb-12">
      <div>
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
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

        <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
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

      <div className="flex items-center justify-center lg:justify-end">
        <img
          src="/images/hero/heropeachtools.webp"
          alt="Peach Lab design tools illustration"
          className="w-full max-w-[460px] object-contain sm:max-w-[560px] lg:max-w-[620px]"
        />
      </div>
    </section>
  );
}