import type { ReactNode } from "react";

type SectionTitleProps = {
    title: string;
    right?: ReactNode;
    className?: string;
    titleClassName?: string;
};

export default function SectionTitle({
    title,
    right,
    className = "",
    titleClassName = "",
}: SectionTitleProps) {
    return (
        <div className={`flex items-center justify-between gap-4 ${className}`}>
            <div className="flex min-w-0 items-center gap-3">
                <span className="h-5 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />

                <h3
                    className={`truncate text-xl font-semibold tracking-tight text-[#111827] md:text-2xl ${titleClassName}`}
                >
                    {title}
                </h3>
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
        </div>
    );
}