import { t } from "@/data/messages";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#F1E5DF] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F28C6F] text-white">
              🍑
            </div>
            <span className="text-lg font-semibold">Peach Lab</span>
          </div>

          <p className="max-w-xs text-sm leading-6 text-gray-500">
            {t.home.footerDescription}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">
            {t.home.footerProduct}
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>{t.home.popularTools}</li>
            <li>{t.home.allTools}</li>
            <li>{t.home.navCategories}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">
            {t.home.footerResources}
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>{t.home.footerBlog}</li>
            <li>{t.home.footerGuides}</li>
            <li>{t.home.footerHelpCenter}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">
            {t.home.footerStayInLoop}
          </h3>
          <p className="mb-3 text-sm text-gray-500">
            {t.home.footerUpdateDescription}
          </p>

          <div className="flex gap-2">
            <input
              placeholder={t.home.footerEmailPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm outline-none focus:border-[#F28C6F]"
            />

            <button className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white">
              {t.home.footerSubscribe}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F1E5DF] py-5 text-center text-sm text-gray-500">
        {t.home.footerCopyright}
      </div>
    </footer>
  );
}