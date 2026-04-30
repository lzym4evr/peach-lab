import { categories, tools } from "@/data/tools";
import { t } from "@/data/messages";

export default function AllTools() {
  return (
    <section id="all-tools" className="mx-auto max-w-7xl px-6 py-4">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
          <h2 className="text-xl font-semibold">{t.home.allTools}</h2>
        </div>

        <select className="hidden rounded-xl border border-[#F1E5DF] bg-white px-4 py-2 text-sm text-gray-600 md:block">
          <option>{t.home.popular}</option>
          <option>{t.home.newest}</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button className="rounded-full bg-[#FFF0EA] px-4 py-2 text-sm font-medium text-[#F28C6F]">
          {t.home.all}
        </button>

        {categories.slice(0, 7).map((category) => (
          <button
            key={category.key}
            className="rounded-full border border-[#F1E5DF] bg-white px-4 py-2 text-sm text-gray-600 transition hover:border-[#F28C6F]"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-[#F1E5DF] bg-white p-4 shadow-sm transition hover:border-[#F28C6F] hover:bg-[#FFFDFC]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-2xl">
              {tool.icon}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900">{tool.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {tool.description}
              </p>
            </div>

            <span className="text-gray-400">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}