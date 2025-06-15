import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ShiftAttendance from "@/app/driver/home/ShiftAttendance";
import { startOfDay } from "date-fns";
import LogoutButton from "@/app/components/LogoutButton";

export default async function DriverHomePage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DRIVER") redirect("/sign-in");

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
        if (!lastPayout || new Date(key) > lastPayout.paidAt) totalUnpaid += dayAmount;

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
        <main className="min-h-screen from-[#f9f9fb] to-[#eef0f5] text-[#1c1c1e] px-6 py-14">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-14">
                    <h1 className="text-4xl font-[450] tracking-tight">
                        Delivery<span className="text-gray-400">CTRL</span>
                    </h1>
                    <LogoutButton />
                </header>

                {/* Welcome */}
                <section className="mb-8">
                    <h2 className="text-2xl font-[450]">Welcome, {session.user.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Driver Dashboard</p>
                </section>

                {/* Profile Summary */}
                <section className="glass-card mb-8">
                    <h2 className="text-lg font-[450] mb-3">Profile Summary</h2>
                    <div className="text-sm text-gray-800 space-y-1">
                        <p><strong>Name:</strong> {session.user.name}</p>
                        <p><strong>Vehicle:</strong> {driver.vehicleType.replace("_", " ")}</p>
                        <p><strong>Shift:</strong> {driver.shift}</p>
                        <p><strong>Base Salary:</strong> ₹{driver.baseSalary}</p>
                        <p className="text-green-700 font-medium">
                            Unpaid Salary Till Today: ₹{totalUnpaid}
                        </p>
                    </div>
                </section>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <a
                        href="/driver/home/profile"
                        className="bg-black text-white text-sm px-5 py-2 rounded-md font-[450] shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-[1px] transition"
                    >
                        Update Profile
                    </a>
                    <a
                        href="/driver/home/deliveries"
                        className="bg-white text-black text-sm border border-gray-300 px-5 py-2 rounded-md font-[450] shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-[1px] transition"
                    >
                        View Today’s Deliveries
                    </a>
                </div>

                {/* Attendance */}
                <ShiftAttendance driverId={driver.id} shift={driver.shift} />

                {/* Payout History */}
                <section className="pt-10">
                    <h2 className="text-lg font-[450] mb-3">Payout History</h2>
                    <div className="glass-card max-h-[200px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/60 sticky top-0 z-10">
                                <tr>
                                    <th className="text-left px-4 py-2">Paid On</th>
                                    <th className="text-left px-4 py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((p, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50/60">
                                        <td className="px-4 py-2">{p.paidAt.toISOString().split("T")[0]}</td>
                                        <td className="px-4 py-2">₹{p.totalAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Salary Breakdown */}
                <section className="pt-10">
                    <h2 className="text-lg font-[450] mb-3">Salary Breakdown</h2>
                    <div className="glass-card max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/60 sticky top-0 z-10">
                                <tr>
                                    <th className="text-left px-4 py-2">Date</th>
                                    <th className="text-left px-4 py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...allDaysSinceJoining].reverse().map((entry, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50/60">
                                        <td className="px-4 py-2">{entry.date}</td>
                                        <td className="px-4 py-2">₹{entry.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
