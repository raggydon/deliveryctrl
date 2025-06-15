// 'use client';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

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

    if (!admin) return <p className="text-red-500 p-4">Admin profile not found.</p>;

    return (
        <main className="max-w-7xl mx-auto px-6 py-16 text-[#1c1c1e]">
            {/* Branding */}
            <header className="flex justify-between items-center mb-14 ">
                <h1 className="text-4xl font-[450] tracking-tight">
                    Delivery<span className="text-gray-400">CTRL</span>
                </h1>
                <LogoutButton />
            </header>

            {/* Welcome */}
            <section className="mb-10">
                <h2 className="text-2xl font-[450]">Welcome, {session.user.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
            </section>

            {/* Invite Key */}
            {admin.inviteKey && (
                <section className="mb-10">
                    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm text-sm max-w-md">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">Driver Invite Key</span>
                        </div>
                        <div className="mt-2">
                            <span className="font-mono text-base tracking-wide text-gray-700 select-all">
                                {admin.inviteKey}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 leading-snug">
                            Share this with your driver when they sign up.
                        </p>
                    </div>
                </section>

            )}

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-14">
                <a
                    href="/admin/deliveries/new"
                    className="bg-black text-white px-6 py-3 rounded-md text-sm font-[450] shadow-sm transition transform hover:scale-[1.02] hover:-translate-y-[2px] hover:shadow-md cursor-pointer"
                >
                    Create New Delivery
                </a>
                <a
                    href="/admin/deliveries"
                    className="bg-white text-black border border-gray-200 px-6 py-3 rounded-md text-sm font-[450] shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-[2px] transition cursor-pointer"
                >
                    View All Deliveries
                </a>
                <Link href="/admin/drivers">
                    <button className="bg-black text-white px-6 py-3 rounded-md text-sm font-[450] shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-[2px] transition cursor-pointer">
                        Your Drivers
                    </button>
                </Link>
            </div>

            {/* Recent Deliveries */}
            <section>
                <h3 className="text-xl font-[450] mb-6">Recent Deliveries</h3>
                {admin.deliveries && admin.deliveries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    if (status === "FAILED_ATTEMPT") return 2;
                                    return 3;
                                };
                                const dateCompare = getDatePriority(a.deliveryDate) - getDatePriority(b.deliveryDate);
                                if (dateCompare !== 0) return dateCompare;
                                return getStatusPriority(a.status) - getStatusPriority(b.status);
                            })
                            .slice(0, 6)
                            .map((delivery) => (
                                <div
                                    key={delivery.id}
                                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition transform hover:shadow-md hover:scale-[1.015] hover:-translate-y-[2px]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-base font-[450]">{delivery.description}</h4>
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full ${delivery.status === "DELIVERED"
                                                    ? "bg-gray-900 text-white"
                                                    : delivery.status === "IN_TRANSIT"
                                                        ? "bg-[#2c5282] text-white"
                                                        : delivery.status === "FAILED_ATTEMPT"
                                                            ? "bg-[#e11d48] text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {delivery.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p>
                                            <strong>Date:</strong> {new Date(delivery.deliveryDate).toDateString()}
                                        </p>
                                        <p>
                                            <strong>Size:</strong> {delivery.size}
                                        </p>
                                        <p>
                                            <strong>Vehicle:</strong> {delivery.vehiclePreference.replace("_", " ")}
                                        </p>
                                        <p>
                                            <strong>Driver:</strong>{" "}
                                            {delivery.driver ? delivery.driver.name : <span className="text-red-500">Unassigned</span>}
                                        </p>
                                        {delivery.status === "FAILED_ATTEMPT" && delivery.failureReason && (
                                            <p className="text-red-600 font-medium pt-2">
                                                Failed Reason: {delivery.failureReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 font-mono">No deliveries found.</p>
                )}
            </section>
        </main>
    );
}
