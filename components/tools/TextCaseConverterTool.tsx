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

function getWords(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function toCamelCase(value: string) {
  const words = getWords(value.toLowerCase());

  return words
    .map((word, index) => {
      if (index === 0) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

function toPascalCase(value: string) {
  return getWords(value.toLowerCase())
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toSnakeCase(value: string) {
  return getWords(value.toLowerCase()).join("_");
}

function toKebabCase(value: string) {
  return getWords(value.toLowerCase()).join("-");
}

function capitalizeWords(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function removeExtraSpaces(value: string) {
  return value.replace(/[ \t]+/g, " ").replace(/\s+\n/g, "\n").trim();
}

function removeLineBreaks(value: string) {
  return value.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
}

function reverseText(value: string) {
  return value.split("").reverse().join("");
}

export default function TextCaseConverterTool() {
  const text = t.textCaseConverter;
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedStatKey, setCopiedStatKey] = useState("");
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

      if (statCopyTimerRef.current) {
        clearTimeout(statCopyTimerRef.current);
      }
    };
  }, []);

  function clearCopiedState() {
    setCopied(false);
    setCopiedStatKey("");

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }

    if (statCopyTimerRef.current) {
      clearTimeout(statCopyTimerRef.current);
      statCopyTimerRef.current = null;
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
      setCopiedStatKey("");

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

  async function copyStatValue(key: string, value: number) {
    try {
      await navigator.clipboard.writeText(String(value));

      setCopiedStatKey(key);
      setCopied(false);

      if (statCopyTimerRef.current) {
        clearTimeout(statCopyTimerRef.current);
      }

      statCopyTimerRef.current = setTimeout(() => {
        setCopiedStatKey("");
      }, 1500);
    } catch {
      setCopiedStatKey("");
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
    <>
      <div className="space-y-6 pb-2 lg:pb-0">
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

            <button
              type="button"
              onClick={() => applyTransform(toCamelCase(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.camelCase}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(toPascalCase(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.pascalCase}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(toSnakeCase(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.snakeCase}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(toKebabCase(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.kebabCase}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(capitalizeWords(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.capitalizeWords}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(removeExtraSpaces(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.removeExtraSpaces}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(removeLineBreaks(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.removeLineBreaks}
            </button>

            <button
              type="button"
              onClick={() => applyTransform(reverseText(inputText))}
              disabled={!inputText}
              className={neutralButtonClass}
            >
              {text.reverseText}
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

        <section className="hidden md:block md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
          <SectionHeader title={text.statsTitle} />

          <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
            <StatCard label={text.characters} value={stats.characters} />

            <StatCard
              label={text.noSpaces}
              value={stats.charactersNoSpaces}
            />

            <StatCard label={text.words} value={stats.words} />

            <StatCard label={text.lines} value={stats.lines} />
          </div>
        </section>
      </div>

      <MobileStatsActionBar
        text={text}
        stats={stats}
        copied={copied}
        copiedStatKey={copiedStatKey}
        canCopy={!!inputText}
        onCopyText={copyText}
        onCopyStatValue={copyStatValue}
      />
    </>
  );
}

function MobileStatsActionBar({
  text,
  stats,
  copied,
  copiedStatKey,
  canCopy,
  onCopyText,
  onCopyStatValue,
}: {
  text: typeof t.textCaseConverter;
  stats: {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    lines: number;
  };
  copied: boolean;
  copiedStatKey: string;
  canCopy: boolean;
  onCopyText: () => void;
  onCopyStatValue: (key: string, value: number) => void;
}) {
  const actionBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSpace = () => {
      const element = actionBarRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();

      document.documentElement.style.setProperty(
        "--mobile-action-bar-space",
        `${Math.ceil(rect.height + 24)}px`,
      );
    };

    const timer = window.setTimeout(updateSpace, 0);
    window.addEventListener("resize", updateSpace);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateSpace);
      document.documentElement.style.removeProperty(
        "--mobile-action-bar-space",
      );
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[60] px-3 md:hidden">
      <div
        ref={actionBarRef}
        className="pointer-events-auto mx-auto max-w-md rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
      >
        <div className="grid grid-cols-4 gap-2">
          <MobileStatButton
            label={text.characters}
            value={stats.characters}
            copied={copiedStatKey === "characters"}
            onClick={() => onCopyStatValue("characters", stats.characters)}
          />

          <MobileStatButton
            label={text.noSpaces}
            value={stats.charactersNoSpaces}
            copied={copiedStatKey === "no-spaces"}
            onClick={() =>
              onCopyStatValue("no-spaces", stats.charactersNoSpaces)
            }
          />

          <MobileStatButton
            label={text.words}
            value={stats.words}
            copied={copiedStatKey === "words"}
            onClick={() => onCopyStatValue("words", stats.words)}
          />

          <MobileStatButton
            label={text.lines}
            value={stats.lines}
            copied={copiedStatKey === "lines"}
            onClick={() => onCopyStatValue("lines", stats.lines)}
          />
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={onCopyText}
            disabled={!canCopy}
            className="w-full rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B] disabled:bg-[#F8D9CF] disabled:opacity-75"
          >
            {copied ? text.copied : text.copyResult}
          </button>

          <p className="mt-1.5 text-center text-[10px] font-medium leading-4 text-[#9C7B70]">
            {text.statCopyHint}
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileStatButton({
  label,
  value,
  copied,
  onClick,
}: {
  label: string;
  value: number;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] px-1.5 py-2 text-center transition hover:bg-[#FFF7F3]"
    >
      <span className="block truncate text-[9px] font-semibold uppercase tracking-wide text-[#9C7B70]">
        {copied ? "Copied" : label}
      </span>

      <span className="mt-0.5 block truncate text-sm font-bold text-gray-900">
        {value}
      </span>
    </button>
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