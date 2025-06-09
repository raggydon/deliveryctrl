"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const InstallAppButton = dynamic(() => import(".././components/InstallAppButton"), {
    ssr: false,
});

export default function SignInPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        if (res?.ok) {
            router.refresh();
            router.push("/auth/redirect");
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <main className="min-h-screen bg-white text-black px-6 py-12 flex flex-col items-center">
            {/* Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            {/* Sign-In Form */}
            <div className="w-full max-w-md bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-semibold mb-6 text-center">Sign In</h1>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-black"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-black"
                    />

                    <button
                        type="submit"
                        className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-sm text-gray-700 mt-6 text-center">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="text-gray-900 font-medium hover:underline"
                    >
                        Sign up here
                    </Link>
                </p>
            </div>

            {/* Install App Button for mobile */}
            <InstallAppButton />
        </main>
    );
}
