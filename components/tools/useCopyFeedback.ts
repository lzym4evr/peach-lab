import { useRef, useState } from "react";

export function useCopyFeedback() {
    const [copiedKey, setCopiedKey] = useState("");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    async function copyWithFeedback(
        value: string,
        key: string,
        onError?: () => void,
    ) {
        try {
            await navigator.clipboard.writeText(value);

            setCopiedKey(key);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setCopiedKey("");
            }, 1500);
        } catch {
            onError?.();
        }
    }

    return {
        copiedKey,
        copyWithFeedback,
    };
}