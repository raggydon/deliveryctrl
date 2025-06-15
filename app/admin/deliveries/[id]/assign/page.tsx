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
        <main className="min-h-screen bg-[url('/soft-bg.png')] bg-cover bg-no-repeat text-black px-4 py-10">
            {/* Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-medium tracking-tight text-gray-800 backdrop-blur-md  px-8 py-4">
                    <h1 className="text-4xl font-[450] tracking-tight">
                        Delivery<span className="text-gray-400">CTRL</span>
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-light tracking-tight">Assign Delivery</h1>
                    <Link
                        href="/admin/dashboard"
                        className="text-sm px-4 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-600 hover:bg-gray-100 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Delivery Info */}
                <div className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-md text-sm text-gray-700">
                    <p><span className="font-medium">Description:</span> {delivery.description}</p>
                    <p><span className="font-medium">Size:</span> {delivery.size}</p>
                    <p><span className="font-medium">Time Preference:</span> {delivery.timePreference}</p>
                    <p><span className="font-medium">Vehicle Required:</span> {delivery.vehiclePreference.replace("_", " ")}</p>
                </div>

                {/* Drivers List */}
                {filteredDrivers.length === 0 ? (
                    <p className="text-red-500 text-sm text-center font-medium">
                        No eligible drivers available for this shift and vehicle.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {filteredDrivers.map((driver: any) => (
                            <form
                                key={driver.id}
                                action={`/api/delivery/assign/${delivery.id}`}
                                method="POST"
                                className="bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-lg transition"
                            >
                                <div className="text-gray-800">
                                    <p className="font-medium tracking-tight">{driver.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {driver.vehicleType.replace("_", " ")} • {driver.shift}
                                    </p>
                                </div>
                                <input type="hidden" name="driverId" value={driver.id} />
                                <button
                                    type="submit"
                                    className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-black transition"
                                >
                                    Assign
                                </button>
                            </form>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
