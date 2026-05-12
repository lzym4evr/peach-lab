"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

export default function CharacterCounterTool() {
    const text = t.characterCounter;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const statCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [inputText, setInputText] = useState("");
    const [copied, setCopied] = useState(false);
    const [copiedStats, setCopiedStats] = useState(false);
    const [copiedStatKey, setCopiedStatKey] = useState("");

    const stats = useMemo(() => {
        const characters = inputText.length;
        const charactersNoSpaces = inputText.replace(/\s/g, "").length;
        const spaces = (inputText.match(/\s/g) || []).length;
        const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
        const lines = inputText ? inputText.split(/\r\n|\r|\n/).length : 0;
        const paragraphs = inputText.trim()
            ? inputText
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean).length
            : 0;

        return {
            characters,
            charactersNoSpaces,
            spaces,
            words,
            lines,
            paragraphs,
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

    function getStatsOutput() {
        return `${text.characters}: ${stats.characters}
${text.charactersNoSpaces}: ${stats.charactersNoSpaces}
${text.words}: ${stats.words}
${text.spaces}: ${stats.spaces}
${text.lines}: ${stats.lines}
${text.paragraphs}: ${stats.paragraphs}`;
    }

    function clearCopiedState() {
        setCopied(false);
        setCopiedStats(false);
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

    async function copyText() {
        try {
            await navigator.clipboard.writeText(inputText);

            setCopied(true);
            setCopiedStats(false);
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

    async function copyStatValue(key: string, label: string, value: number) {
        try {
            await navigator.clipboard.writeText(`${label}: ${value}`);

            setCopiedStatKey(key);
            setCopied(false);
            setCopiedStats(false);

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

    async function copyAllStats() {
        try {
            await navigator.clipboard.writeText(getStatsOutput());

            setCopiedStats(true);
            setCopied(false);
            setCopiedStatKey("");

            if (statCopyTimerRef.current) {
                clearTimeout(statCopyTimerRef.current);
            }

            statCopyTimerRef.current = setTimeout(() => {
                setCopiedStats(false);
            }, 1500);
        } catch {
            setCopiedStats(false);
        }
    }

    function clearText() {
        setInputText("");
        clearCopiedState();
    }

    const primaryButtonClass =
        "rounded-xl bg-[#F28C6F] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

    const whiteButtonClass =
        "rounded-xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-4 md:py-3 md:text-sm";

    return (
        <>
            <div className="space-y-6 pb-2 lg:pb-0">
                <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                        <div>
                            <SectionHeader title={text.enterText} />

                            <p className="mt-2 max-w-[420px] text-sm leading-6 text-gray-500">
                                {text.description}
                            </p>
                        </div>

                        <div className="hidden gap-3 md:flex md:shrink-0 md:flex-wrap md:justify-end">
                            <button
                                type="button"
                                onClick={copyText}
                                disabled={!inputText}
                                className={`${primaryButtonClass} md:w-auto`}
                            >
                                {copied ? text.copied : text.copyText}
                            </button>

                            <button
                                type="button"
                                onClick={clearText}
                                disabled={!inputText}
                                className={`${whiteButtonClass} md:w-auto`}
                            >
                                {text.clear}
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={inputText}
                        onChange={(event) => updateText(event.target.value)}
                        placeholder={text.placeholder}
                        className="h-[240px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4 text-sm leading-6 text-gray-800 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-[300px]"
                    />
                </section>

                <section className="hidden md:block md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <SectionHeader title={text.statsTitle} />

                        <div className="flex items-center gap-3">
                            <p className="text-right text-xs font-medium text-[#9C7B70]">
                                {text.statCopyHint}
                            </p>

                            <button
                                type="button"
                                onClick={copyAllStats}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copiedStats ? text.copied : text.copyStats}
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                        <StatCard
                            label={text.characters}
                            value={stats.characters}
                            copied={copiedStatKey === "characters"}
                            copiedText={text.copied}
                            onClick={() =>
                                copyStatValue("characters", text.characters, stats.characters)
                            }
                        />

                        <StatCard
                            label={text.charactersNoSpaces}
                            value={stats.charactersNoSpaces}
                            copied={copiedStatKey === "characters-no-spaces"}
                            copiedText={text.copied}
                            onClick={() =>
                                copyStatValue(
                                    "characters-no-spaces",
                                    text.charactersNoSpaces,
                                    stats.charactersNoSpaces,
                                )
                            }
                        />

                        <StatCard
                            label={text.words}
                            value={stats.words}
                            copied={copiedStatKey === "words"}
                            copiedText={text.copied}
                            onClick={() => copyStatValue("words", text.words, stats.words)}
                        />

                        <StatCard
                            label={text.spaces}
                            value={stats.spaces}
                            copied={copiedStatKey === "spaces"}
                            copiedText={text.copied}
                            onClick={() => copyStatValue("spaces", text.spaces, stats.spaces)}
                        />

                        <StatCard
                            label={text.lines}
                            value={stats.lines}
                            copied={copiedStatKey === "lines"}
                            copiedText={text.copied}
                            onClick={() => copyStatValue("lines", text.lines, stats.lines)}
                        />

                        <StatCard
                            label={text.paragraphs}
                            value={stats.paragraphs}
                            copied={copiedStatKey === "paragraphs"}
                            copiedText={text.copied}
                            onClick={() =>
                                copyStatValue("paragraphs", text.paragraphs, stats.paragraphs)
                            }
                        />
                    </div>
                </section>
            </div>

            <MobileStatsActionBar
                text={text}
                stats={stats}
                copied={copied}
                copiedStats={copiedStats}
                copiedStatKey={copiedStatKey}
                canCopy={!!inputText}
                onCopyText={copyText}
                onCopyStats={copyAllStats}
                onCopyStatValue={copyStatValue}
            />
        </>
    );
}

function MobileStatsActionBar({
    text,
    stats,
    copied,
    copiedStats,
    copiedStatKey,
    canCopy,
    onCopyText,
    onCopyStats,
    onCopyStatValue,
}: {
    text: typeof t.characterCounter;
    stats: {
        characters: number;
        charactersNoSpaces: number;
        spaces: number;
        words: number;
        lines: number;
        paragraphs: number;
    };
    copied: boolean;
    copiedStats: boolean;
    copiedStatKey: string;
    canCopy: boolean;
    onCopyText: () => void;
    onCopyStats: () => void;
    onCopyStatValue: (key: string, label: string, value: number) => void;
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
                <div className="grid grid-cols-3 gap-2">
                    <MobileStatButton
                        label={text.characters}
                        value={stats.characters}
                        copied={copiedStatKey === "characters"}
                        copiedText={text.copied}
                        onClick={() =>
                            onCopyStatValue("characters", text.characters, stats.characters)
                        }
                    />

                    <MobileStatButton
                        label={text.charactersNoSpaces}
                        value={stats.charactersNoSpaces}
                        copied={copiedStatKey === "characters-no-spaces"}
                        copiedText={text.copied}
                        onClick={() =>
                            onCopyStatValue(
                                "characters-no-spaces",
                                text.charactersNoSpaces,
                                stats.charactersNoSpaces,
                            )
                        }
                    />

                    <MobileStatButton
                        label={text.words}
                        value={stats.words}
                        copied={copiedStatKey === "words"}
                        copiedText={text.copied}
                        onClick={() => onCopyStatValue("words", text.words, stats.words)}
                    />

                    <MobileStatButton
                        label={text.spaces}
                        value={stats.spaces}
                        copied={copiedStatKey === "spaces"}
                        copiedText={text.copied}
                        onClick={() =>
                            onCopyStatValue("spaces", text.spaces, stats.spaces)
                        }
                    />

                    <MobileStatButton
                        label={text.lines}
                        value={stats.lines}
                        copied={copiedStatKey === "lines"}
                        copiedText={text.copied}
                        onClick={() => onCopyStatValue("lines", text.lines, stats.lines)}
                    />

                    <MobileStatButton
                        label={text.paragraphs}
                        value={stats.paragraphs}
                        copied={copiedStatKey === "paragraphs"}
                        copiedText={text.copied}
                        onClick={() =>
                            onCopyStatValue(
                                "paragraphs",
                                text.paragraphs,
                                stats.paragraphs,
                            )
                        }
                    />
                </div>

                <div className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onCopyText}
                            disabled={!canCopy}
                            className="w-full rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B] disabled:bg-[#F8D9CF] disabled:opacity-75"
                        >
                            {copied ? text.copied : text.copyText}
                        </button>

                        <button
                            type="button"
                            onClick={onCopyStats}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {copiedStats ? text.copied : text.copyStats}
                        </button>
                    </div>

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
    copiedText,
    onClick,
}: {
    label: string;
    value: number;
    copied: boolean;
    copiedText: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="min-w-0 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] px-1.5 py-2 text-center transition hover:bg-[#FFF7F3]"
        >
            <span className="block truncate text-[9px] font-semibold uppercase tracking-wide text-[#9C7B70]">
                {copied ? copiedText : label}
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

function StatCard({
    label,
    value,
    copied,
    copiedText,
    onClick,
}: {
    label: string;
    value: number;
    copied: boolean;
    copiedText: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-left transition hover:border-[#F28C6F] hover:bg-[#FFF0EA]"
        >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9C7B70]">
                {copied ? copiedText : label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </button>
    );
}