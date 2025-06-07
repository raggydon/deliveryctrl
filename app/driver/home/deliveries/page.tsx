"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Delivery {
    id: string;
    description: string;
    address: string;
    deliveryDate: string;
    status: "NOT_PICKED" | "IN_TRANSIT" | "DELIVERED";
}

export default function DriverDeliveries() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [error, setError] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchDeliveries = async () => {
            const res = await fetch("/api/deliveries/today");
            const data = await res.json();
            if (res.ok) {
                setDeliveries(data.deliveries);
            } else {
                setError(data.error || "Failed to load deliveries.");
            }
        };
        fetchDeliveries();
    }, []);

    const updateStatus = async (id: string, nextStatus: Delivery["status"]) => {
        const res = await fetch(`/api/delivery/status/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
        });

        if (res.ok) {
            setDeliveries((prev) =>
                prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
            );
        } else {
            const data = await res.json();
            setError(data.error || "Failed to update status.");
        }
    };

    const getNextStatus = (status: Delivery["status"]) => {
        switch (status) {
            case "NOT_PICKED":
                return "IN_TRANSIT";
            case "IN_TRANSIT":
                return "DELIVERED";
            default:
                return null;
        }
    };

    const sortDeliveries = (a: Delivery, b: Delivery) => {
        const today = new Date();
        const dateA = new Date(a.deliveryDate);
        const dateB = new Date(b.deliveryDate);

        const getDatePriority = (date: Date) => {
            if (date < today) return 0;
            if (date.toDateString() === today.toDateString()) return 1;
            return 2;
        };

        const getStatusPriority = (status: Delivery["status"]) => {
            if (status === "NOT_PICKED") return 0;
            if (status === "IN_TRANSIT") return 1;
            return 2;
        };

        const dateDiff = getDatePriority(dateA) - getDatePriority(dateB);
        if (dateDiff !== 0) return dateDiff;

        return getStatusPriority(a.status) - getStatusPriority(b.status);
    };

    return (
        <main className="max-w-4xl mx-auto px-6 py-10 text-black">
            {/* Branding */}
            <div className="mb-8 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            {/* Page Heading */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold">Assigned Deliveries</h1>
                <p className="text-sm text-gray-600 mt-1">Update statuses as you complete them</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <ul className="space-y-4">
                {deliveries
                    .slice()
                    .sort(sortDeliveries)
                    .map((delivery) => (
                        <li
                            key={delivery.id}
                            className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="mb-2">
                                <p className="font-medium text-lg text-gray-800">{delivery.description}</p>
                                <p className="text-sm text-gray-600">{delivery.address}</p>
                            </div>

                            <div className="text-sm text-gray-700 space-y-1">
                                <p><b>Date:</b> {new Date(delivery.deliveryDate).toDateString()}</p>
                                <p>
                                    <b>Status:</b>{" "}
                                    <span className={
                                        delivery.status === "DELIVERED"
                                            ? "text-green-700 font-medium"
                                            : delivery.status === "IN_TRANSIT"
                                                ? "text-yellow-700 font-medium"
                                                : "text-red-600 font-medium"
                                    }>
                                        {delivery.status.replace("_", " ")}
                                    </span>
                                </p>
                            </div>

                            {delivery.status !== "DELIVERED" && (
                                <button
                                    onClick={() =>
                                        updateStatus(delivery.id, getNextStatus(delivery.status)!)
                                    }
                                    className="mt-4 px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm rounded transition"
                                >
                                    Mark as {getNextStatus(delivery.status)?.replace("_", " ")}
                                </button>
                            )}
                        </li>
                    ))}
            </ul>

            {/* Back Button */}
            <div className="mt-10 flex justify-center">
                <button
                    onClick={() => router.push("/driver/home")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded transition"
                >
                    ← Back to Home
                </button>
            </div>
        </main>
    );
}
