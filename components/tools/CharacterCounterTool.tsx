"use client";

import { useMemo, useState } from "react";
import { t } from "@/data/messages";

export default function CharacterCounterTool() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const stats = useMemo(() => {
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, "").length;
        const spaces = (text.match(/\s/g) || []).length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
        const paragraphs = text.trim()
            ? text
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
                    {t.characterCounter.enterText}
                </label>

                <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={t.characterCounter.placeholder}
                    className="min-h-60 w-full resize-y rounded-2xl border border-[#F1E5DF] bg-white p-4 text-sm leading-6 text-gray-800 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={copyText}
                    className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                >
                    {copied ? t.common.copied : t.characterCounter.copyText}
                </button>

                <button
                    onClick={clearText}
                    className="rounded-xl border border-[#F1E5DF] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#F28C6F]"
                >
                    {t.characterCounter.clear}
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.characters}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stats.characters}</p>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.charactersNoSpaces}
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {stats.charactersNoSpaces}
                    </p>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.words}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stats.words}</p>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.spaces}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stats.spaces}</p>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.lines}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stats.lines}</p>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.characterCounter.paragraphs}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stats.paragraphs}</p>
                </div>
            </div>
        </div>
    );
}