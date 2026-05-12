"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(value: string) {
  const lower = value.toLowerCase();

  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) =>
    match.toUpperCase(),
  );
}

export default function TextCaseConverterTool() {
  const text = t.textCaseConverter;
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [redoHistory, setRedoHistory] = useState<string[]>([]);

  const stats = useMemo(() => {
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, "").length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const lines = inputText ? inputText.split(/\r\n|\r|\n/).length : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
    };
  }, [inputText]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  function clearCopiedState() {
    setCopied(false);

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }

  function updateText(value: string) {
    setInputText(value);
    clearCopiedState();
  }

  function applyTransform(nextText: string) {
    if (nextText === inputText) return;

    setHistory((current) => [...current, inputText]);
    setRedoHistory([]);
    setInputText(nextText);
    clearCopiedState();
  }

  function handleUndo() {
    setHistory((current) => {
      if (!current.length) return current;

      const previousText = current[current.length - 1];
      const nextHistory = current.slice(0, -1);

      setRedoHistory((redoCurrent) => [...redoCurrent, inputText]);
      setInputText(previousText);
      clearCopiedState();

      return nextHistory;
    });
  }

  function handleRedo() {
    setRedoHistory((current) => {
      if (!current.length) return current;

      const nextText = current[current.length - 1];
      const nextRedoHistory = current.slice(0, -1);

      setHistory((historyCurrent) => [...historyCurrent, inputText]);
      setInputText(nextText);
      clearCopiedState();

      return nextRedoHistory;
    });
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(inputText);

      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  function clearText() {
    if (!inputText) return;

    setHistory((current) => [...current, inputText]);
    setRedoHistory([]);
    setInputText("");
    clearCopiedState();
  }

  const primaryButtonClass =
    "rounded-xl bg-[#F28C6F] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

  const peachButtonClass =
    "rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2.5 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

  const whiteButtonClass =
    "rounded-xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

  const neutralButtonClass =
    "rounded-xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

  return (
    <div className="space-y-6">
      <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <SectionHeader title={text.enterText} />

            <p className="mt-2 max-w-[420px] text-sm leading-6 text-gray-500">
              {text.description}
            </p>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(event) => updateText(event.target.value)}
          placeholder={text.placeholder}
          className="h-[220px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4 text-sm leading-6 text-gray-800 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-[260px]"
        />
      </section>

      <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
        <SectionHeader title={text.actionsTitle} />

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => applyTransform(inputText.toUpperCase())}
            disabled={!inputText}
            className={primaryButtonClass}
          >
            {text.uppercase}
          </button>

          <button
            type="button"
            onClick={() => applyTransform(inputText.toLowerCase())}
            disabled={!inputText}
            className={peachButtonClass}
          >
            {text.lowercase}
          </button>

          <button
            type="button"
            onClick={() => applyTransform(toTitleCase(inputText))}
            disabled={!inputText}
            className={neutralButtonClass}
          >
            {text.titleCase}
          </button>

          <button
            type="button"
            onClick={() => applyTransform(toSentenceCase(inputText))}
            disabled={!inputText}
            className={neutralButtonClass}
          >
            {text.sentenceCase}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={copyText}
            disabled={!inputText}
            className={primaryButtonClass}
          >
            {copied ? text.copied : text.copyResult}
          </button>

          <button
            type="button"
            onClick={clearText}
            disabled={!inputText}
            className={whiteButtonClass}
          >
            {text.clear}
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className={whiteButtonClass}
          >
            {text.undo}
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoHistory.length === 0}
            className={whiteButtonClass}
          >
            {text.redo}
          </button>
        </div>
      </section>

      <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
        <SectionHeader title={text.statsTitle} />

        <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          <StatCard
            label={text.characters}
            value={stats.characters}
          />

          <StatCard
            label={text.noSpaces}
            value={stats.charactersNoSpaces}
          />

          <StatCard label={text.words} value={stats.words} />

          <StatCard label={text.lines} value={stats.lines} />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-1.5 rounded-full bg-[#F28C6F]" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5 md:p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C7B70] md:text-xs">
        {label}
      </p>

      <p className="mt-1 text-base font-bold text-gray-900 md:mt-2 md:text-2xl">
        {value}
      </p>
    </div>
  );
}