import { categories } from "@/data/tools";
import { t } from "@/data/messages";

export default function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
        <h2 className="text-xl font-semibold">{t.home.browseByCategory}</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9">
        {categories.map((category) => (
          <a
            key={category.key}
            href={`#${category.key.toLowerCase().replaceAll(" ", "-")}`}
            className="rounded-2xl border border-[#F1E5DF] bg-white p-3 text-center shadow-sm transition hover:border-[#F28C6F] hover:bg-[#FFF7F3] md:p-4"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0EA] text-xl md:mb-3 md:h-12 md:w-12 md:text-2xl">
              {category.icon}
            </div>

            <h3 className="text-xs font-semibold md:text-sm">
              {category.name}
            </h3>
          </a>
        ))}
      </div>
    </section>
  );
}