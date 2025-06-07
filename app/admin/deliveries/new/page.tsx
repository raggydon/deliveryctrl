"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function CreateDeliveryPage() {
    const router = useRouter();

    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [size, setSize] = useState<"SMALL" | "LARGE">("SMALL");
    const [timePreference, setTimePreference] = useState<"MORNING" | "EVENING">("MORNING");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [vehiclePreference, setVehiclePreference] = useState<"BIKE" | "MINI_TRUCK">("BIKE");
    const [price, setPrice] = useState<number>(0);
    const [error, setError] = useState("");
    const [deliveryCreated, setDeliveryCreated] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/delivery/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description,
                address,
                size,
                timePreference,
                deliveryDate,
                vehiclePreference,
                price,
            }),
        });

        if (res.ok) {
            setDeliveryCreated(true);  // show confirmation
            setDescription("");
            setAddress("");
            setSize("SMALL");
            setTimePreference("MORNING");
            setDeliveryDate("");
            setVehiclePreference("BIKE");
            setPrice(50);
        } else {
            const data = await res.json();
            setError(data.error || "Something went wrong.");
        }

    };

    useEffect(() => {
        if (size === "SMALL" && vehiclePreference === "BIKE") {
            setPrice(50);
        } else if (size === "SMALL" && vehiclePreference === "MINI_TRUCK") {
            setPrice(80);
        } else if (size === "LARGE" && vehiclePreference === "MINI_TRUCK") {
            setPrice(120);
        }
    }, [size, vehiclePreference]);

    return (
        <main className="min-h-screen bg-white text-black px-6 py-10">
            {/* DeliveryCTRL Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            {/* Delivery Creation Form */}
            <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 border border-gray-300 backdrop-blur-md bg-white/60">
                <h1 className="text-2xl font-semibold mb-6">Create New Delivery</h1>

                {deliveryCreated && (
                    <p className="text-grray-400 text-sm font-medium mb-4 text-center">
                        Delivery created successfully!
                    </p>
                )}

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="text"
                        placeholder="Delivery Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-black"
                    />

                    <input
                        type="text"
                        placeholder="Delivery Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-black"
                    />

                    <select
                        value={size}
                        onChange={(e) => {
                            const newSize = e.target.value as "SMALL" | "LARGE";
                            setSize(newSize);
                            if (newSize === "LARGE") setVehiclePreference("MINI_TRUCK");
                            else setVehiclePreference("BIKE");
                        }}
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    >
                        <option value="SMALL">Small</option>
                        <option value="LARGE">Large</option>
                    </select>

                    <select
                        value={vehiclePreference}
                        onChange={(e) => setVehiclePreference(e.target.value as "BIKE" | "MINI_TRUCK")}
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                        disabled={size === "LARGE"}
                    >
                        {size === "SMALL" ? (
                            <>
                                <option value="BIKE">Bike</option>
                                <option value="MINI_TRUCK">Mini Truck</option>
                            </>
                        ) : (
                            <option value="MINI_TRUCK">Mini Truck (Required)</option>
                        )}
                    </select>

                    <select
                        value={timePreference}
                        onChange={(e) => setTimePreference(e.target.value as "MORNING" | "EVENING")}
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    >
                        <option value="MORNING">Morning</option>
                        <option value="EVENING">Evening</option>
                    </select>

                    <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    />

                    <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded px-3 py-2">
                        <label className="font-medium">Delivery Price</label>
                        <span className="text-gray-700">₹{price}</span>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition"
                    >
                        Confirm & Create Delivery
                    </button>
                </form>
            </div>

            {/* Back Button */}
            <div className="mt-10 flex justify-center">
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="text-sm px-4 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-700 hover:bg-gray-100 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </main>
    );
}
