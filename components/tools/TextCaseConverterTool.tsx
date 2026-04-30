"use client";

import { useMemo, useState } from "react";
import { t } from "@/data/messages";

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(value: string) {
  const lower = value.toLowerCase();

  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) =>
    match.toUpperCase()
  );
}

export default function TextCaseConverterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
    };
  }, [text]);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function clearText() {
    setText("");
    setCopied(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-800">
          {t.textCaseConverter.enterText}
        </label>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t.textCaseConverter.placeholder}
          className="min-h-52 w-full resize-y rounded-2xl border border-[#F1E5DF] bg-white p-4 text-sm leading-6 text-gray-800 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setText(text.toUpperCase())}
          className="rounded-xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
        >
          {t.textCaseConverter.uppercase}
        </button>

        <button
          onClick={() => setText(text.toLowerCase())}
          className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
        >
          {t.textCaseConverter.lowercase}
        </button>

        <button
          onClick={() => setText(toTitleCase(text))}
          className="rounded-xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#FFF7F3]"
        >
          {t.textCaseConverter.titleCase}
        </button>

        <button
          onClick={() => setText(toSentenceCase(text))}
          className="rounded-xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#FFF7F3]"
        >
          {t.textCaseConverter.sentenceCase}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={copyText}
          className="rounded-xl border border-[#F1E5DF] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#F28C6F]"
        >
          {copied ? t.common.copied : t.textCaseConverter.copyResult}
        </button>

        <button
          onClick={clearText}
          className="rounded-xl border border-[#F1E5DF] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#F28C6F]"
        >
          {t.textCaseConverter.clear}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
          <p className="text-xs text-gray-500">
            {t.textCaseConverter.characters}
          </p>
          <p className="mt-1 text-2xl font-bold">{stats.characters}</p>
        </div>

        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
          <p className="text-xs text-gray-500">
            {t.textCaseConverter.noSpaces}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {stats.charactersNoSpaces}
          </p>
        </div>

        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
          <p className="text-xs text-gray-500">{t.textCaseConverter.words}</p>
          <p className="mt-1 text-2xl font-bold">{stats.words}</p>
        </div>

        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
          <p className="text-xs text-gray-500">{t.textCaseConverter.lines}</p>
          <p className="mt-1 text-2xl font-bold">{stats.lines}</p>
        </div>
      </div>
    </div>
  );
}