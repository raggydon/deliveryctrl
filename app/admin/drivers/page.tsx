'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Driver {
    id: string;
    name: string;
    email: string;
    vehicleType: string;
    shift: string;
    baseSalary: number;
    joiningDate: string;
    lastSalaryPayout: string | null;
    assignedDeliveries: number;
    deliveredToday: number;
    isActive: boolean; // ensure this is fetched from backend
}

export default function YourDriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [totalPayableMap, setTotalPayableMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState<Record<string, { successRate: number | null, attendanceRate: number | null }>>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
    const [breakdownData, setBreakdownData] = useState<{
        breakdown: { date: string; amount: number }[];
        payouts: { paidAt: string; totalAmount: number }[];
    }>({
        breakdown: [],
        payouts: [],
    });

    const [breakdownDriverName, setBreakdownDriverName] = useState("");

    const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

    useEffect(() => {
        fetch("/api/admin/drivers")
            .then((res) => res.json())
            .then(async (data) => {
                const activeDrivers = data.drivers.filter((d: Driver) => d.isActive !== false);
                setDrivers(activeDrivers);
                const map: Record<string, number> = {};
                for (const driver of activeDrivers) {
                    const res = await fetch(`/api/salary/total/${driver.id}`);
                    const json = await res.json();
                    map[driver.id] = json.totalPayable;
                }
                setTotalPayableMap(map);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        drivers.forEach(async (driver) => {
            const res = await fetch(`/api/drivers/performance/${driver.id}`);
            const json = await res.json();
            setPerformance(prev => ({
                ...prev,
                [driver.id]: {
                    successRate: json.successRate,
                    attendanceRate: json.attendanceRate,
                },
            }));
        });
    }, [drivers]);

    const openModal = (driverId: string) => {
        setSelectedDriverId(driverId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedDriverId(null);
        setAmount("");
        setReason("");
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        if (!selectedDriverId || !amount) return;
        const res = await fetch("/api/salary/adjust", {
            method: "POST",
            body: JSON.stringify({
                driverId: selectedDriverId,
                amount: parseInt(amount),
                reason,
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            alert("Salary adjusted");
            closeModal();
            const res = await fetch(`/api/salary/total/${selectedDriverId}`);
            const json = await res.json();
            setTotalPayableMap((prev) => ({
                ...prev,
                [selectedDriverId]: json.totalPayable,
            }));
        } else {
            alert("Error adjusting salary");
        }
    };

    const handleOpenBreakdown = async (driverId: string) => {
        setBreakdownModalOpen(true);
        const driver = drivers.find((d) => d.id === driverId);
        setBreakdownDriverName(driver?.name || "");
        const res = await fetch(`/api/salary/breakdown/${driverId}`);
        const json = await res.json();
        setBreakdownData({
            breakdown: json.breakdown || [],
            payouts: json.payouts || [],
        });

    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <img src="/cat-loader.gif" alt="Loading..." className="w-36 opacity-80" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 py-10 text-black">
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Your Drivers</h1>
                    <Link href="/admin/dashboard">
                        <button className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md transition">
                            ← Back to Dashboard
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl p-5 shadow-md transition hover:shadow-lg">
                            <div className="mb-2">
                                <h2 className="font-semibold text-lg text-gray-800">{driver.name}</h2>
                                <p className="text-sm text-gray-600">{driver.email}</p>
                            </div>

                            <div className="text-sm text-gray-700 space-y-1 mb-2">
                                <p><b>Vehicle:</b> {driver.vehicleType}</p>
                                <p><b>Shift:</b> {driver.shift}</p>
                                <p><b>Assigned:</b> {driver.assignedDeliveries} • <b>Delivered:</b> {driver.deliveredToday}</p>
                            </div>

                            {performance[driver.id] && (
                                <div className="text-sm text-gray-600 space-y-1 mb-2">
                                    <p><b>Success Rate:</b> {performance[driver.id]?.successRate != null ? `${performance[driver.id]!.successRate!.toFixed(0)}%` : "N/A"}</p>
                                    <p><b>Attendance:</b> {performance[driver.id]?.attendanceRate != null ? `${performance[driver.id]!.attendanceRate!.toFixed(0)}%` : "N/A"}</p>
                                </div>
                            )}

                            <p className="text-sm font-semibold text-green-700 mb-2">
                                ₹{totalPayableMap[driver.id] ?? "Loading..."} payable till today
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => openModal(driver.id)} className="bg-yellow-200 hover:bg-yellow-300 text-black py-1 px-2 rounded text-sm">
                                    Adjust Today's Salary
                                </button>
                                <button onClick={() => handleOpenBreakdown(driver.id)} className="bg-indigo-100 hover:bg-indigo-200 text-black py-1 px-2 rounded text-sm">
                                    Breakdown
                                </button>
                                <button
                                    onClick={async () => {
                                        const res = await fetch(`/api/salary/mark-paid/${driver.id}`, { method: "POST" });
                                        if (res.ok) {
                                            alert("Marked as paid");
                                            setTotalPayableMap((prev) => ({ ...prev, [driver.id]: 0 }));
                                        }
                                    }}
                                    className="bg-green-100 hover:bg-green-200 text-black py-1 px-2 rounded text-sm col-span-2"
                                >
                                    Mark Salary Paid
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!confirm(`Remove ${driver.name}?`)) return;
                                        const res = await fetch(`/api/drivers/remove/${driver.id}`, { method: "DELETE" });


                                        if (res.ok) {
                                            alert("Driver removed");
                                            setDrivers(prev => prev.filter(d => d.id !== driver.id));
                                        }
                                    }}
                                    className="bg-red-100 hover:bg-red-200 text-black py-1 px-2 rounded text-sm col-span-2"
                                >
                                    Remove Driver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && selectedDriver && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Adjust Today's Salary</h2>
                        <input
                            type="number"
                            className="w-full border border-gray-300 p-2 rounded mb-2"
                            placeholder={`₹${Math.round(selectedDriver.baseSalary / 30)}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <textarea
                            className="w-full border border-gray-300 p-2 rounded mb-4"
                            placeholder="Reason (optional)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {breakdownModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-xl w-full text-sm">
                        <h2 className="text-lg font-semibold mb-3">Breakdown: {breakdownDriverName}</h2>

                        <h3 className="text-md font-semibold mb-2 mt-4">Payout History</h3>
                        <div className="border rounded mb-4 max-h-[150px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Paid On</th>
                                        <th className="p-2 text-left">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdownData.payouts?.map((p: any, idx: number) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">{new Date(p.paidAt).toISOString().split("T")[0]}</td>
                                            <td className="p-2">₹{p.totalAmount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="overflow-y-auto max-h-[300px] border rounded">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="p-2 text-left">Date</th>
                                        <th className="p-2 text-left">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...breakdownData.breakdown || []].reverse().map((entry, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">{entry.date}</td>
                                            <td className="p-2">₹{entry.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setBreakdownModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                </div>


            )}
        </main>
    );
}
