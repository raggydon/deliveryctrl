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
            <main className="p-6 text-red-500 font-semibold">Admin profile not found.</main>
        );
    }

    const deliveries = await prisma.delivery.findMany({
        where: { adminId: admin.id },
        include: { driver: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main
            className="min-h-screen px-6 py-14 text-[#1c1c1e]"
            style={{
                backgroundImage: "url('/backgrounds/delivery-ctrl-bg.png')", // use same background asset
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >

            <div className="mb-10 flex justify-center">
                <div className="text-3xl font-medium tracking-tight text-gray-800 backdrop-blur-md  px-8 py-4">
                    <h1 className="text-4xl font-[450] tracking-tight">
                        Delivery<span className="text-gray-400">CTRL</span>
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto space-y-10">
                {/* Header Row */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-medium">All Deliveries</h2>
                    <Link
                        href="/admin/dashboard"
                        className="text-sm px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Delivery Cards */}
                {deliveries.length === 0 ? (
                    <p className="text-gray-600">No deliveries created yet.</p>
                ) : (
                    <ul className="space-y-6">
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
                                    getDatePriority(a.deliveryDate) -
                                    getDatePriority(b.deliveryDate);
                                if (dateCompare !== 0) return dateCompare;
                                return getStatusPriority(a.status) - getStatusPriority(b.status);
                            })
                            .map((delivery) => (
                                <li
                                    key={delivery.id}
                                    className="relative bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl px-6 py-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${delivery.status === "DELIVERED"
                                                    ? "bg-green-50 text-green-800"
                                                    : delivery.status === "IN_TRANSIT"
                                                        ? "bg-yellow-50 text-yellow-800"
                                                        : delivery.status === "FAILED_ATTEMPT"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {delivery.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {delivery.description}
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Address:</span> {delivery.address}
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span>{" "}
                                            {new Date(delivery.deliveryDate).toDateString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">Size:</span> {delivery.size}
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
                                                <span className="text-red-600">Unassigned</span>
                                            )}
                                        </p>
                                    </div>

                                    {delivery.status === "FAILED_ATTEMPT" &&
                                        delivery.failureReason && (
                                            <p className="mt-4 text-sm text-red-700 font-medium">
                                                <b>Failed Reason:</b> {delivery.failureReason}
                                            </p>
                                        )}

                                    {!delivery.assigned && (
                                        <div className="mt-5">
                                            <Link
                                                href={`/admin/deliveries/${delivery.id}/assign`}
                                                className="inline-block text-sm font-medium bg-black text-white px-4 py-2 rounded-md hover:opacity-90 hover:scale-[1.01] transition"
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
