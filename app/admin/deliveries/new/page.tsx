"use client";

import { useState, useEffect, ChangeEvent } from "react";
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

    const [bulkErrors, setBulkErrors] = useState<{ row: number; error: string }[]>([]);
    const [successCount, setSuccessCount] = useState<number | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/delivery/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            setDeliveryCreated(true);
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

    const handleBulkUpload = async () => {
        if (!fileToUpload) return;

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const res = await fetch("/api/deliveries/bulk-upload", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            setSuccessCount(data.successCount);
            setBulkErrors(data.errors || []);
        } else {
            setError("Bulk upload failed.");
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
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl shadow-xl p-8 border border-gray-300 backdrop-blur-md bg-white/60">
                <h1 className="text-2xl font-semibold mb-6">Create New Delivery</h1>

                {deliveryCreated && (
                    <p className="text-gray-500 text-sm font-medium mb-4 text-center">
                        Delivery created successfully.
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
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    />
                    <input
                        type="text"
                        placeholder="Delivery Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    />
                    <select
                        value={size}
                        onChange={(e) => {
                            const newSize = e.target.value as "SMALL" | "LARGE";
                            setSize(newSize);
                            setVehiclePreference(newSize === "LARGE" ? "MINI_TRUCK" : "BIKE");
                        }}
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    >
                        <option value="SMALL">Small</option>
                        <option value="LARGE">Large</option>
                    </select>
                    <select
                        value={vehiclePreference}
                        onChange={(e) => setVehiclePreference(e.target.value as "BIKE" | "MINI_TRUCK")}
                        disabled={size === "LARGE"}
                        className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
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

            <div className="max-w-xl mx-auto mt-16 space-y-6 text-center">
                <div className="space-y-3">
                    <label className="block text-sm font-medium">Upload .xlsx file for multiple deliveries</label>
                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                        className="text-sm border border-gray-300 bg-white px-4 py-2 rounded-md w-full max-w-sm mx-auto"
                    />
                    <button
                        onClick={handleBulkUpload}
                        className="bg-gray-800 hover:bg-black text-white text-sm px-4 py-2 rounded transition"
                    >
                        Upload Deliveries
                    </button>
                </div>

                <a
                    href="/templates/delivery_template.xlsx"
                    download
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-5 py-2 rounded-md border border-gray-300 transition"
                >
                    Download Excel Template for Bulk Upload
                </a>

                {successCount !== null && (
                    <p className="text-sm text-green-700 font-medium">
                        {successCount} deliveries created successfully.
                    </p>
                )}

                {bulkErrors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600 space-y-1 text-left">
                        {bulkErrors.map((err, i) => (
                            <p key={i}>Row {err.row}: {err.error}</p>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 flex justify-center">
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
