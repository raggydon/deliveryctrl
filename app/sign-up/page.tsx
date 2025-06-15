"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const AddToHomeScreenPrompt = dynamic(
    () => import("../components/InstallAppButton"),
    { ssr: false }
);

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "DRIVER",
        inviteKey: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/sign-up", {
                method: "POST",
                body: JSON.stringify(form),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Sign-up failed");
                return;
            }

            router.push("/sign-in");
        } catch (err) {
            setError("Something went wrong.");
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

            {/* Sign-Up Card */}
            <div className="w-full max-w-md bg-white/30 border border-[1px] border-[#d1d5db33] rounded-2xl shadow-xl p-8 backdrop-blur-xl shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">
                <h1 className="text-xl font-[450] mb-6 text-center tracking-tight text-gray-800">
                    Create an Account
                </h1>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <option value="DRIVER">Driver</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    {form.role === "DRIVER" && (
                        <input
                            name="inviteKey"
                            placeholder="Admin's Invite Key"
                            onChange={handleChange}
                            className="border border-gray-300 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    )}

                    <button
                        type="submit"
                        className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition transform hover:scale-[1.02] hover:-translate-y-[1.5px] hover:shadow-md"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-sm text-gray-600 mt-6 text-center">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-gray-800 font-medium hover:underline">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-10">
                <AddToHomeScreenPrompt />
            </div>
        </main>
    );
}
