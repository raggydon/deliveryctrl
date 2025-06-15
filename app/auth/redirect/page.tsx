"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSession().then((session) => {
            if (!session?.user) {
                router.replace("/sign-in");
            } else if (session.user.role === "ADMIN") {
                router.replace("/admin/dashboard");
            } else if (session.user.role === "DRIVER") {
                router.replace("/driver/home");
            } else {
                router.replace("/onboarding");
            }
        });
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <img
                src="/cat-loader.gif"
                alt="Redirecting..."
                className="w-36 opacity-80 mb-4"
            />
            <p className="text-sm text-gray-500 font-medium">Redirecting you to your dashboard...</p>
        </div>
    );
}