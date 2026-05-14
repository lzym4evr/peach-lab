import { t } from "@/data/messages";

export default function Footer() {
  return (
    <footer
      className="mt-6 border-t border-[#F1E5DF] bg-white md:mt-12"
      style={{
        marginBottom:
          "max(calc(var(--mobile-action-bar-space, 0px) - 0.75rem), 0px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-8 md:grid md:grid-cols-4 md:gap-8 md:py-10">
        <div>
          <div className="mb-3 flex items-center">
            <img
              src="/brand/peach-lab-logo.svg"
              alt="Peach Lab"
              className="h-10 w-auto md:h-9"
            />
          </div>

          <p className="max-w-sm text-sm leading-6 text-gray-500 md:max-w-xs">
            {t.home.footerDescription}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-6 md:mt-0 md:contents">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2A1F1B]">
              {t.home.footerProduct}
            </h3>

            <ul className="space-y-2 text-sm text-gray-500">
              <li>{t.home.popularTools}</li>
              <li>{t.home.allTools}</li>
              <li>{t.home.navCategories}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2A1F1B]">
              {t.home.footerResources}
            </h3>

            <ul className="space-y-2 text-sm text-gray-500">
              <li>{t.home.footerBlog}</li>
              <li>{t.home.footerGuides}</li>
              <li>{t.home.footerHelpCenter}</li>
            </ul>
          </div>
        </div>

        <div className="mt-7 md:mt-0">
          <h3 className="mb-2 text-sm font-semibold text-[#2A1F1B] md:mb-3">
            {t.home.footerStayInLoop}
          </h3>

          <p className="mb-3 text-sm leading-6 text-gray-500">
            {t.home.footerUpdateDescription}
          </p>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] md:flex md:gap-2">
            <input
              placeholder={t.home.footerEmailPlaceholder}
              className="min-w-0 rounded-xl border border-[#F1E5DF] px-3 py-2.5 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:flex-1 md:py-2"
            />

            <button className="rounded-xl bg-[#F28C6F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E6765B] md:py-2">
              {t.home.footerSubscribe}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F1E5DF] px-6 py-4 text-center text-xs text-gray-500 md:py-5 md:text-sm">
        {t.home.footerCopyright}
      </div>
    </footer>
  );
}