import { categories, tools } from "@/data/tools";
import { t } from "@/data/messages";
import { ColorPickerIcon } from "@/components/icons/ToolIcons";

function renderToolIcon(tool: (typeof tools)[number]) {
  if (tool.slug === "color-picker") {
    return <ColorPickerIcon className="h-8 w-8" />;
  }

  return tool.icon;
}

export default function AllTools() {
  return (
    <section
      id="all-tools"
      className="scroll-mt-28 mx-auto max-w-7xl px-6 py-4 md:scroll-mt-24"
    >
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

      <div className="-mx-6 mb-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex md:flex-wrap md:gap-2 md:overflow-visible md:px-0 md:pb-0">
        <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
          <button className="h-10 rounded-full bg-[#FFF0EA] px-5 text-sm font-semibold text-[#F28C6F] shadow-sm">
            {t.home.all}
          </button>

          {categories.slice(0, 7).map((category) => (
            <button
              key={category.key}
              className="h-10 whitespace-nowrap rounded-full border border-[#F1E5DF] bg-white px-5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#F28C6F] hover:bg-[#FFF7F3] hover:text-[#E6765B]"
            >
              <span className="md:hidden">
                {category.name.replace(" Tools", "")}
              </span>
              <span className="hidden md:inline">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-[#F1E5DF] bg-white p-4 shadow-sm transition duration-200 hover:border-[#F28C6F] hover:bg-[#FFFDFC] active:-translate-y-0.5 active:scale-[0.99] active:border-[#F28C6F] active:bg-[#FFF7F3]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-2xl">
              {renderToolIcon(tool)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900">{tool.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {tool.description}
              </p>
            </div>

            <span className="text-gray-400 transition group-hover:text-[#F28C6F]">
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}