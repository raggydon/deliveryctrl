"use client";

import { useEffect, useState } from "react";

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler as any);
        return () => window.removeEventListener("beforeinstallprompt", handler as any);
    }, []);

    const handleClick = () => {
        if (deferredPrompt) {
            (deferredPrompt as any).prompt();
        } else {
            alert("On Android, go to browser menu and select 'Add to Home screen'." + "\n" + "\n" + "On IOS, tap the share icon and select 'Add to Home Screen'.");
        }
    };

    if (!isMobile) return null;

    return (
        <button
            onClick={handleClick}
            className="mt-6 pt bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 px-4 py-2 rounded-lg shadow-sm text-sm transition"
        >
            Install DeliveryCTRL App
        </button>
    );
}
