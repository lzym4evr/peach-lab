import { categories } from "@/data/tools";
import { t } from "@/data/messages";

export default function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
        <h2 className="text-xl font-semibold">{t.home.browseByCategory}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-9">
        {categories.map((category) => (
          <a
            key={category.key}
            href={`#${category.key.toLowerCase().replaceAll(" ", "-")}`}
            className="rounded-2xl border border-[#F1E5DF] bg-white p-4 text-center shadow-sm transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0EA] text-2xl">
              {category.icon}
            </div>

            <h3 className="text-sm font-semibold">{category.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}