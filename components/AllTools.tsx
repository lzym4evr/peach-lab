"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, tools } from "@/data/tools";
import { t } from "@/data/messages";
import IconRenderer from "@/components/icons/IconRenderer";

type SortType = "popular" | "newest";

export default function AllTools() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortType, setSortType] = useState<SortType>("popular");

  useEffect(() => {
    function handleCategoryFilter(event: Event) {
      const customEvent = event as CustomEvent<{ category: string }>;
      const category = customEvent.detail?.category;

      if (!category) return;

      setActiveCategory(category);

      window.setTimeout(() => {
        const target = document.getElementById("all-tools");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }

    window.addEventListener("peachlab:filter-category", handleCategoryFilter);

    return () => {
      window.removeEventListener("peachlab:filter-category", handleCategoryFilter);
    };
  }, []);

  const filteredTools = useMemo(() => {
    const nextTools =
      activeCategory === "All"
        ? [...tools]
        : tools.filter((tool) => tool.category === activeCategory);

    if (sortType === "popular") {
      return nextTools.sort((a, b) => {
        if (a.featured === b.featured) return 0;
        return a.featured ? -1 : 1;
      });
    }

    return nextTools;
  }, [activeCategory, sortType]);

  function handleCategoryClick(categoryKey: string) {
    setActiveCategory(categoryKey);

    window.setTimeout(() => {
      const target = document.getElementById("all-tools");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <section
      id="all-tools"
      className="scroll-mt-28 mx-auto max-w-7xl px-6 py-4 md:scroll-mt-24"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-1 w-6 rounded-full bg-[#F28C6F]" />
          <h2 className="text-xl font-semibold">{t.home.allTools}</h2>
        </div>

        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value as SortType)}
          className="hidden rounded-xl border border-[#F1E5DF] bg-white px-4 py-2 text-sm text-gray-600 outline-none transition hover:border-[#F28C6F] focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:block"
        >
          <option value="popular">{t.home.popular}</option>
          <option value="newest">{t.home.newest}</option>
        </select>
      </div>

      <div className="-mx-6 mb-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex md:flex-wrap md:gap-2 md:overflow-visible md:px-0 md:pb-0">
        <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
          <button
            type="button"
            onClick={() => handleCategoryClick("All")}
            className={`h-10 rounded-full px-5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${activeCategory === "All"
                ? "bg-[#FFF0EA] text-[#F28C6F]"
                : "border border-[#F1E5DF] bg-white text-gray-600 hover:border-[#F28C6F] hover:bg-[#FFF7F3] hover:text-[#E6765B]"
              }`}
          >
            {t.home.all}
          </button>

          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleCategoryClick(category.key)}
              className={`h-10 whitespace-nowrap rounded-full px-5 text-sm font-medium shadow-sm transition active:scale-[0.98] ${activeCategory === category.key
                  ? "bg-[#FFF0EA] text-[#F28C6F]"
                  : "border border-[#F1E5DF] bg-white text-gray-600 hover:border-[#F28C6F] hover:bg-[#FFF7F3] hover:text-[#E6765B]"
                }`}
            >
              <span className="md:hidden">
                {category.name.replace(" Tools", "")}
              </span>
              <span className="hidden md:inline">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex md:hidden">
        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value as SortType)}
          className="w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm text-gray-600 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
        >
          <option value="popular">{t.home.popular}</option>
          <option value="newest">{t.home.newest}</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-[#F1E5DF] bg-white p-4 shadow-sm transition duration-200 hover:border-[#F28C6F] hover:bg-[#FFFDFC] active:-translate-y-0.5 active:scale-[0.99] active:border-[#F28C6F] active:bg-[#FFF7F3]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-2xl">
              <IconRenderer
                type="tool"
                name={tool.slug}
                fallback={tool.icon}
                className="h-8 w-8"
              />
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