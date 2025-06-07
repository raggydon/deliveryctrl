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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                vehicleType,
                shift,
                baseSalary,
            }),
        });

        if (res.ok) {
            router.push("/driver/home");
        } else {
            const data = await res.json();
            setError(data.error || "Failed to update profile.");
        }
    };

    return (
        <main className="max-w-xl mx-auto px-6 py-10 text-black">
            {/* Branding */}
            <div className="mb-8 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold">Update Driver Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Set your shift and vehicle preference</p>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl p-6 space-y-4 shadow">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Vehicle Type</label>
                    <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value as "BIKE" | "MINI_TRUCK")}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm transition"
                >
                    Save Changes
                </button>
            </form>

            {/* Back to Home */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => router.push("/driver/home")}
                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded transition"
                >
                    ← Back to Home
                </button>
            </div>
        </main>
    );
}
