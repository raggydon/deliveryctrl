"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateDeliveryPage() {
    const router = useRouter();

    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [size, setSize] = useState<"SMALL" | "LARGE">("SMALL");
    const [timePreference, setTimePreference] = useState<"MORNING" | "EVENING">("MORNING");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [vehiclePreference, setVehiclePreference] = useState<"BIKE" | "MINI_TRUCK">("BIKE");
    const [price, setPrice] = useState<number>(50);
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
        if (size === "SMALL" && vehiclePreference === "BIKE") setPrice(50);
        else if (size === "SMALL" && vehiclePreference === "MINI_TRUCK") setPrice(80);
        else if (size === "LARGE") setPrice(120);
    }, [size, vehiclePreference]);

    return (
        <main className="min-h-screen px-6 py-16 text-[#1c1c1e]">
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-medium tracking-tight text-gray-800 backdrop-blur-md  px-8 py-4">
                    <h1 className="text-4xl font-[450] tracking-tight">
                        Delivery<span className="text-gray-400">CTRL</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-md px-6 py-8">
                <h2 className="text-2xl font-semibold mb-6">Create New Delivery</h2>

                {deliveryCreated && (
                    <p className="text-green-600 text-sm mb-4 text-center font-medium">Delivery created successfully.</p>
                )}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Delivery Description"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    />

                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="Delivery Address"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    />

                    <select
                        value={size}
                        onChange={(e) => {
                            const value = e.target.value as "SMALL" | "LARGE";
                            setSize(value);
                            setVehiclePreference(value === "LARGE" ? "MINI_TRUCK" : "BIKE");
                        }}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
                    >
                        <option value="SMALL">Small</option>
                        <option value="LARGE">Large</option>
                    </select>

                    <select
                        value={vehiclePreference}
                        onChange={(e) => setVehiclePreference(e.target.value as "BIKE" | "MINI_TRUCK")}
                        disabled={size === "LARGE"}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
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
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
                    >
                        <option value="MORNING">Morning</option>
                        <option value="EVENING">Evening</option>
                    </select>

                    <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
                    />

                    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md border border-gray-300">
                        <label className="text-sm font-medium">Delivery Price</label>
                        <span className="text-sm text-gray-700">₹{price}</span>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white text-sm font-medium px-4 py-2 rounded-md transition transform hover:scale-[1.02] hover:-translate-y-[2px] hover:shadow-md"
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
                        className="text-sm border border-gray-300 bg-white px-4 py-2 rounded-md w-full"
                    />
                    <button
                        onClick={handleBulkUpload}
                        className="bg-black text-white text-sm px-4 py-2 rounded-md hover:scale-[1.01] transition"
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

            <div className="mt-16 flex justify-center">
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="text-sm px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </main>
    );
}
