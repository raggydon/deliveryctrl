"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function DriverProfilePage() {
    const router = useRouter();

    const [vehicleType, setVehicleType] = useState<"BIKE" | "MINI_TRUCK">("BIKE");
    const [shift, setShift] = useState<"MORNING" | "EVENING" | "BOTH">("MORNING");
    const [baseSalary, setBaseSalary] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        if (vehicleType === "BIKE") {
            if (shift === "BOTH") setBaseSalary(15000);
            else if (shift === "MORNING") setBaseSalary(8000);
            else if (shift === "EVENING") setBaseSalary(5000);
        } else if (vehicleType === "MINI_TRUCK") {
            if (shift === "BOTH") setBaseSalary(25000);
            else if (shift === "MORNING") setBaseSalary(12000);
            else if (shift === "EVENING") setBaseSalary(8000);
        }
    }, [vehicleType, shift]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/driver/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleType, shift, baseSalary }),
        });

        if (res.ok) {
            router.push("/driver/home");
        } else {
            const data = await res.json();
            setError(data.error || "Failed to update profile.");
        }
    };

    return (
        <main className="min-h-screen from-[#f9f9fb] to-[#eef0f5] text-[#1c1c1e] px-4 py-14">
            <div className="max-w-xl mx-auto">
                {/* Branding */}
                <div className="mb-10 flex justify-center">
                    <div className="text-3xl font-medium tracking-tight text-gray-800 backdrop-blur-md  px-8 py-4">
                        <h1 className="text-4xl font-[450] tracking-tight">
                            Delivery<span className="text-gray-400">CTRL</span>
                        </h1>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">Update Driver Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Set your shift and vehicle preference</p>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                {/* Glassy Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="glass-card space-y-5"
                >
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Vehicle Type</label>
                        <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value as "BIKE" | "MINI_TRUCK")}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white/90"
                        >
                            <option value="BIKE">Bike</option>
                            <option value="MINI_TRUCK">Mini Truck</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Preferred Shift</label>
                        <select
                            value={shift}
                            onChange={(e) => setShift(e.target.value as "MORNING" | "EVENING" | "BOTH")}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white/90"
                        >
                            <option value="MORNING">Morning</option>
                            <option value="EVENING">Evening</option>
                            <option value="BOTH">Both</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-800">
                        <strong>Calculated Base Salary:</strong> ₹{baseSalary}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-900 transition"
                    >
                        Save Changes
                    </button>
                </form>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push("/driver/home")}
                        className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded transition"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </main>
    );
}
