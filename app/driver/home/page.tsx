import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ShiftAttendance from "@/app/driver/home/ShiftAttendance";
import { startOfDay } from "date-fns";
import LogoutButton from "@/app/components/LogoutButton";
import React from "react";

export default async function DriverHomePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DRIVER") {
        redirect("/sign-in");
    }

    const driver = await prisma.driver.findUnique({
        where: { userId: session.user.id },
    });

    if (!driver) {
        return (
            <main className="max-w-2xl mx-auto p-6 text-red-500 font-medium">
                Driver profile not found.
            </main>
        );
    }

    const dailyDefault = Math.round(driver.baseSalary / 30);
    const overrides = await prisma.dailySalaryOverride.findMany({
        where: { driverId: driver.id },
    });

    const overrideMap = new Map<string, number>();
    overrides.forEach((o) => {
        const key = o.date.toISOString().split("T")[0];
        overrideMap.set(key, o.actualPaid);
    });

    const today = startOfDay(new Date());

    const lastPayout = await prisma.salaryPayout.findFirst({
        where: { driverId: driver.id },
        orderBy: { paidAt: "desc" },
    });

    const allDaysSinceJoining: { date: string; amount: number; overridden: boolean }[] = [];
    let totalUnpaid = 0;

    const date = new Date(driver.joiningDate);
    date.setHours(0, 0, 0, 0);

    while (date <= today) {
        const key = date.toISOString().split("T")[0];
        const overriddenAmount = overrideMap.get(key);
        const dayAmount = overriddenAmount ?? dailyDefault;

        // Count only if after last payout for unpaid salary total
        if (!lastPayout || new Date(key) > lastPayout.paidAt) {
            totalUnpaid += dayAmount;
        }

        allDaysSinceJoining.push({
            date: key,
            amount: dayAmount,
            overridden: overriddenAmount !== undefined,
        });

        date.setDate(date.getDate() + 1);
    }

    const payouts = await prisma.salaryPayout.findMany({
        where: { driverId: driver.id },
        orderBy: { paidAt: "desc" },
    });

    return (
        <main className="max-w-5xl mx-auto px-6 py-8 text-black">
            <div className="mb-8 flex justify-between items-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
                <div className="ml-auto">
                    <LogoutButton />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Welcome, {session.user.name}</h2>
                <p className="text-gray-600 mt-2 text-sm">Driver Dashboard</p>
            </div>

            <section className="bg-white border m-5 border-gray-200 rounded-xl shadow-sm p-6 space-y-2">
                <h2 className="text-lg font-semibold mb-2">Profile Summary</h2>
                <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Name:</strong> {session.user.name}</p>
                    <p><strong>Vehicle:</strong> {driver.vehicleType.replace("_", " ")}</p>
                    <p><strong>Shift:</strong> {driver.shift}</p>
                    <p><strong>Base Salary:</strong> ₹{driver.baseSalary}</p>
                    <p className="text-green-700 font-medium">
                        Unpaid Salary Till Today: ₹{totalUnpaid}
                    </p>
                </div>
            </section>

            <div className="flex gap-3 flex-wrap">
                <a href="/driver/home/profile" className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md text-sm transition">
                    Update Profile
                </a>
                <a href="/driver/home/deliveries" className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-md text-sm transition border">
                    View Today’s Deliveries
                </a>
            </div>

            <ShiftAttendance driverId={driver.id} shift={driver.shift} />

            <section className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Payout History</h2>
                <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="text-left px-4 py-2">Paid On</th>
                                <th className="text-left px-4 py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p, idx) => (
                                <tr key={idx} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{p.paidAt.toISOString().split("T")[0]}</td>
                                    <td className="px-4 py-2">₹{p.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Salary Breakdown</h2>
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="text-left px-4 py-2">Date</th>
                                <th className="text-left px-4 py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...allDaysSinceJoining].reverse().map((entry, idx) => (
                                <tr key={idx} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{entry.date}</td>
                                    <td className="px-4 py-2">₹{entry.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
