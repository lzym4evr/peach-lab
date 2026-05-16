import { categories } from "@/data/tools";
import { t } from "@/data/messages";
import IconRenderer from "@/components/icons/IconRenderer";

function getCategoryId(categoryKey: string) {
  return categoryKey.toLowerCase().replaceAll(" ", "-");
}

export default function CategoryGrid() {
  return (
    <section
      id="categories"
      className="scroll-mt-28 mx-auto max-w-7xl px-6 py-8 md:scroll-mt-24"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
        <h2 className="text-xl font-semibold">{t.home.browseByCategory}</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9">
        {categories.map((category) => (
          <a
            key={category.key}
            href={`#all-tools`}
            data-category-target={getCategoryId(category.key)}
            className="group rounded-2xl border border-[#F1E5DF] bg-white p-3 text-center shadow-sm transition duration-200 hover:border-[#F28C6F] hover:bg-[#FFF7F3] active:-translate-y-0.5 active:scale-[0.98] active:border-[#F28C6F] active:bg-[#FFF7F3] md:p-4"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0EA] text-xl md:mb-3 md:h-12 md:w-12 md:text-2xl">
              <IconRenderer
                type="category"
                name={category.key}
                fallback={category.icon}
                className="h-7 w-7 md:h-8 md:w-8"
              />
            </div>

            <h3 className="min-h-[2rem] text-xs font-semibold leading-4 md:min-h-[2.5rem] md:text-sm md:leading-5">
              {category.name}
            </h3>
          </a>
        ))}
      </div>
    </section>
  );
}