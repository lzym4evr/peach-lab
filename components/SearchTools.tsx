"use client";

import { useMemo, useRef, useState } from "react";
import { tools } from "@/data/tools";
import { t } from "@/data/messages";

export default function SearchTools() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement | null>(null);

  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return [];
    }

    return tools
      .filter((tool) => {
        return (
          tool.title.toLowerCase().includes(keyword) ||
          tool.description.toLowerCase().includes(keyword) ||
          tool.category.toLowerCase().includes(keyword) ||
          tool.slug.toLowerCase().includes(keyword)
        );
      })
      .slice(0, 6);
  }, [query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchResults.length === 0) {
      return;
    }

    window.location.href = `/tools/${searchResults[0].slug}`;
  }

  function handleBlur(event: React.FocusEvent<HTMLFormElement>) {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (
      nextFocusedElement &&
      searchRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsOpen(false);
  }

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-8">
      <form
        ref={searchRef}
        onSubmit={handleSubmit}
        onBlur={handleBlur}
        className="relative"
      >
        <div className="relative">
          <input
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            placeholder={t.home.searchPlaceholder}
            className="min-h-12 w-full rounded-2xl border border-[#F1E5DF] px-4 pr-12 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
          />

          <button
            type="submit"
            aria-label="Search tools"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-[#FFF7F3] hover:text-[#F28C6F]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
            >
              <path
                d="M10.75 18.5a7.75 7.75 0 1 1 0-15.5 7.75 7.75 0 0 1 0 15.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16.5 16.5 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {query.trim() && isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-3 rounded-3xl border border-[#F1E5DF] bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-gray-900">
                {t.home.searchResults}
              </p>

              {searchResults.length > 0 && (
                <p className="hidden text-xs text-gray-400 sm:block">
                  {t.home.pressEnterHint}
                </p>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-2">
                {searchResults.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#FFF7F3]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0EA] text-xl">
                      {tool.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        {tool.title}
                      </p>
                      <p className="line-clamp-1 text-sm text-gray-500">
                        {tool.description}
                      </p>
                    </div>

                    <span className="text-sm text-[#F28C6F]">→</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FFF7F3] p-5 text-center text-sm text-gray-500">
                {t.home.noSearchResults}
              </div>
            )}
          </div>
        )}
      </form>
    </section>
  );
}