"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const InstallAppButton = dynamic(() => import("../components/InstallAppButton"), {
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
        <main className="min-h-screen from-[#f9f9fb] to-[#eef0f5] text-[#1c1c1e] px-6 py-14 flex flex-col items-center">
            {/* Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-medium tracking-tight text-gray-800 backdrop-blur-md px-8 py-4">
                    <h1 className="text-4xl font-[450] tracking-tight">
                        Delivery<span className="text-gray-400">CTRL</span>
                    </h1>
                </div>
            </div>

            {/* Sign-In Card */}
            <div className="w-full max-w-md bg-white/30 border border-top-[1px] border-[#d1d5db33] rounded-2xl shadow-xl p-8 backdrop-blur-xl shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">

                <h1 className="text-xl font-[450] mb-6 text-center tracking-tight text-gray-800">
                    Sign in to your account
                </h1>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <button
                        type="submit"
                        className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition transform hover:scale-[1.02] hover:-translate-y-[1.5px] hover:shadow-md"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-sm text-gray-600 mt-6 text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="text-gray-800 font-medium hover:underline">
                        Sign up here
                    </Link>
                </p>
            </div>


            {/* Optional Install App Button */}
            <div className="mt-10">
                <InstallAppButton />
            </div>
        </main>
    );
}
