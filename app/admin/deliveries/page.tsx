import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDeliveriesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/sign-in");
    }

    const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
    });

    if (!admin) {
        return (
            <main className="p-6 text-red-500 font-semibold">
                Admin profile not found.
            </main>
        );
    }

    const deliveries = await prisma.delivery.findMany({
        where: { adminId: admin.id },
        include: { driver: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="min-h-screen bg-white text-black px-6 py-10">
            {/* DeliveryCTRL Branding */}
            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto space-y-8">
                {/* Header & Back Button */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">All Deliveries</h1>
                    <Link
                        href="/admin/dashboard"
                        className="text-sm px-4 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-700 hover:bg-gray-100 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {deliveries.length === 0 ? (
                    <p className="text-gray-600">No deliveries created yet.</p>
                ) : (
                    <ul className="space-y-5">
                        {deliveries
                            .sort((a, b) => {
                                const today = new Date();
                                const getDatePriority = (date: Date) => {
                                    if (date < today) return 0;
                                    if (date.toDateString() === today.toDateString()) return 1;
                                    return 2;
                                };

                                const getStatusPriority = (status: string) => {
                                    if (status === "NOT_PICKED") return 0;
                                    if (status === "IN_TRANSIT") return 1;
                                    return 2;
                                };

                                const dateCompare =
                                    getDatePriority(a.deliveryDate) - getDatePriority(b.deliveryDate);
                                if (dateCompare !== 0) return dateCompare;

                                return getStatusPriority(a.status) - getStatusPriority(b.status);
                            })
                            .map((delivery) => (
                                <li
                                    key={delivery.id}
                                    className="relative bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition"
                                >
                                    {/* Status badge */}
                                    <div className="absolute top-4 right-4">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${delivery.status === "DELIVERED"
                                                    ? "bg-green-100 text-green-800"
                                                    : delivery.status === "IN_TRANSIT"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {delivery.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                                        {delivery.description}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Address:</span>{" "}
                                            {delivery.address}
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span>{" "}
                                            {new Date(delivery.deliveryDate).toDateString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">Size:</span>{" "}
                                            {delivery.size}
                                        </p>
                                        <p>
                                            <span className="font-medium">Vehicle:</span>{" "}
                                            {delivery.vehiclePreference.replace("_", " ")}
                                        </p>
                                        <p>
                                            <span className="font-medium">Driver:</span>{" "}
                                            {delivery.driver ? (
                                                delivery.driver.name
                                            ) : (
                                                <span className="text-red-500">Unassigned</span>
                                            )}
                                        </p>
                                    </div>

                                    {!delivery.assigned && (
                                        <div className="mt-4">
                                            <Link
                                                href={`/admin/deliveries/${delivery.id}/assign`}
                                                className="inline-block text-sm bg-black text-white px-4 py-2 rounded-md hover:opacity-90 transition"
                                            >
                                                Assign
                                            </Link>
                                        </div>
                                    )}
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
