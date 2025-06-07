// "use client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AssignDeliveryPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/sign-in");
    }

    const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
        include: { drivers: true },
    });

    const delivery = await prisma.delivery.findUnique({
        where: { id: params.id },
    });

    if (!admin || !delivery) {
        return (
            <main className="p-6 text-red-500 font-semibold">
                Delivery or Admin not found.
            </main>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eligibleDrivers = await Promise.all(
        admin.drivers.map(async (driver) => {
            const vehicleMatch =
                delivery.vehiclePreference === "MINI_TRUCK"
                    ? driver.vehicleType === "MINI_TRUCK"
                    : true;

            if (!vehicleMatch) return null;

            const attendance = await prisma.attendance.findFirst({
                where: {
                    driverId: driver.id,
                    date: today,
                    shift: delivery.timePreference,
                    active: true,
                },
            });

            return attendance ? driver : null;
        })
    );

    const filteredDrivers = eligibleDrivers.filter(Boolean);

    return (
        <main className="min-h-screen bg-white text-black px-4 py-10">
            {/* Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            <div className="w-full max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Assign Delivery</h1>
                    <Link
                        href="/admin/dashboard"
                        className="text-sm px-4 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-700 hover:bg-gray-100 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Delivery Info */}
                <div className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-md">
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Description:</span> {delivery.description}
                    </p>
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Size:</span> {delivery.size}
                    </p>
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Time Preference:</span>{" "}
                        {delivery.timePreference}
                    </p>
                    <p className="text-gray-700 text-sm">
                        <span className="font-medium">Vehicle Required:</span>{" "}
                        {delivery.vehiclePreference.replace("_", " ")}
                    </p>
                </div>

                {/* Drivers List */}
                {filteredDrivers.length === 0 ? (
                    <p className="text-red-500 mt-6 text-center text-sm font-medium">
                        No eligible drivers available for this shift and vehicle.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {filteredDrivers.map((driver: any) => (
                            <form
                                key={driver.id}
                                action={`/api/delivery/assign/${delivery.id}`}
                                method="POST"
                                className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
                            >
                                <div className="text-gray-800">
                                    <p className="font-semibold">{driver.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {driver.vehicleType.replace("_", " ")} • {driver.shift}
                                    </p>
                                </div>
                                <div>
                                    <input type="hidden" name="driverId" value={driver.id} />
                                    <button
                                        type="submit"
                                        className="bg-black text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </form>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
