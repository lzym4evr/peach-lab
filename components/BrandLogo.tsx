import Link from "next/link";

type BrandLogoProps = {
    className?: string;
    imageClassName?: string;
};

export default function BrandLogo({
    className = "",
    imageClassName = "",
}: BrandLogoProps) {
    return (
        <Link
            href="/"
            aria-label="Peach Lab home"
            className={`inline-flex items-center ${className}`}
        >
            <img
                src="/brand/peach-lab-logo.svg"
                alt="Peach Lab"
                className={`h-9 w-auto md:h-10 ${imageClassName}`}
            />
        </Link>
    );
}