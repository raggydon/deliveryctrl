"use client";

import { useEffect, useState } from "react";

export default function AddToHomeScreenPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    // Detect if we are already in standalone mode (PWA opened as app)
    const checkIfInstalled = () => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        return isStandalone;
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!checkIfInstalled()) {
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Optional: also listen for appinstalled
        window.addEventListener("appinstalled", () => {
            setShowPrompt(false);
        });

        // Initial check on load
        if (checkIfInstalled()) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    // Also, only show if screen is mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (!showPrompt || !isMobile) return null;

    return (
        <div className="fixed bottom-5 left-4 right-4 max-w-sm mx-auto bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 z-50 flex justify-between items-center backdrop-blur-sm">
            <p className="text-sm text-black">Install DeliveryCTRL App?</p>
            <button
                onClick={handleInstallClick}
                className="ml-4 px-4 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-900 transition"
            >
                Install
            </button>
        </div>
    );
}
