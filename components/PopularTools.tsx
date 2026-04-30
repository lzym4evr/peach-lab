import { tools } from "@/data/tools";
import { t } from "@/data/messages";

export default function PopularTools() {
  const popularTools = tools.filter((tool) => tool.featured).slice(0, 6);

  return (
    <section id="popular" className="mx-auto max-w-7xl px-6 pt-4 pb-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-xl font-semibold">
          <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
          {t.home.popularTools}
        </h2>

        <a
          href="#all-tools"
          className="text-sm font-medium text-[#F28C6F]"
        >
          {t.home.viewAllPopularTools}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {popularTools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-2xl border border-[#F1E5DF] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#F28C6F] hover:shadow-md sm:p-5"
          >
            <div className="mb-3 flex h-12 items-center text-3xl sm:h-16 sm:text-4xl">
              {tool.icon}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
              {tool.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm">
              {tool.description}
            </p>

            <div className="mt-4 text-sm font-medium text-[#F28C6F]">
              {t.home.openTool}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}