// app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import LogoutButton from "@/app/components/LogoutButton";


export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/sign-in");
    }

    const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
        include: {
            drivers: true,
            deliveries: {
                include: { driver: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!admin) {
        return <p className="text-red-500 p-4">Admin profile not found.</p>;
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-8 text-black">
            {/* Top Branding */}
            <div className="mb-8 flex justify-between items-center">
                {/* Branding */}
                <div className="text-3xl font-bold tracking-tight bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
                    Delivery<span className="text-gray-500">CTRL</span>
                </div>

                {/* Logout Button */}
                <div className="ml-auto">
                    <LogoutButton />
                </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Welcome, {session.user.name}</h2>
                <p className="text-gray-600 mt-2 text-sm">Admin Dashboard</p>
            </div>

            {/* Invite Key Display */}
            {admin.inviteKey && (
                <div className="mb-6 text-sm">
                    <div className="inline-block bg-gray-100 border border-gray-300 rounded-md px-4 py-2 shadow-sm">
                        <span className="text-gray-600 font-medium mr-2">Your Driver Invite Key:</span>
                        <span className="text-gray-900 font-mono tracking-wide">{admin.inviteKey}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Share this with your drivers when they sign up.</p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
                <a
                    href="/admin/deliveries/new"
                    className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md transition"
                >
                    Create New Delivery
                </a>
                <a
                    href="/admin/deliveries"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
                >
                    View All Deliveries
                </a>
                <Link href="/admin/drivers">
                    <button className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md transition">
                        Your Drivers
                    </button>
                </Link>
            </div>

            {/* Recent Deliveries Section */}
            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Recent Deliveries</h3>

                {admin.deliveries && admin.deliveries.length > 0 ? (
                    <ul className="space-y-4">
                        {admin.deliveries
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
                            .slice(0, 5)
                            .map((delivery) => (
                                <li
                                    key={delivery.id}
                                    className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-md transition hover:shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-800 text-lg">
                                            {delivery.description}
                                        </h4>
                                        <span
                                            className={`text-sm px-2 py-0.5 rounded-full ${delivery.status === "DELIVERED"
                                                    ? "bg-green-100 text-green-800"
                                                    : delivery.status === "IN_TRANSIT"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {delivery.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
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
                                                <span className="text-red-500">Unassigned</span>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No deliveries found.</p>
                )}
            </div>
        </main>
    );
}
