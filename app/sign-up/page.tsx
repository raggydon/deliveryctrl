"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
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
        <main className="min-h-screen bg-white text-black px-4 py-10 flex flex-col items-center">
            {/* Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            <div className="w-full max-w-md bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-md">
                <h1 className="text-2xl font-semibold mb-6 text-center">Create an Account</h1>

                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="p-2 border border-gray-300 rounded bg-white text-black"
                    />
                    <input
                        name="email"
                        placeholder="Email"
                        type="email"
                        onChange={handleChange}
                        required
                        className="p-2 border border-gray-300 rounded bg-white text-black"
                    />
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        onChange={handleChange}
                        required
                        className="p-2 border border-gray-300 rounded bg-white text-black"
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded bg-white text-black"
                    >
                        <option value="DRIVER">Driver</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {form.role === "DRIVER" && (
                        <input
                            name="inviteKey"
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded bg-white text-black"
                            placeholder="Admin's Invite Key"
                        />
                    )}
                    <button
                        type="submit"
                        className="bg-gray-800 hover:bg-black text-white p-2 rounded-md transition"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-sm text-gray-700 mt-6 text-center">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="text-gray-900 font-medium hover:underline"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </main>
    );
}
