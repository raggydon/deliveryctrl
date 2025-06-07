import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
        where: {
            userId: session.user.id,
        },
        include: {
            drivers: {
                where: { isActive: true }, // ✅ only active drivers
                include: {
                    user: { select: { email: true } },
                },
            },
        },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const drivers = await Promise.all(
        admin?.drivers.map(async (driver) => {
            const deliveriesToday = await prisma.delivery.findMany({
                where: {
                    driverId: driver.id,
                    createdAt: { gte: today, lt: tomorrow },
                },
                select: { status: true },
            });

            const assignedDeliveries = deliveriesToday.length;
            const deliveredToday = deliveriesToday.filter(
                (d) => d.status === "DELIVERED"
            ).length;

            return {
                id: driver.id,
                name: driver.name,
                vehicleType: driver.vehicleType,
                shift: driver.shift,
                email: driver.user.email,
                assignedDeliveries,
                deliveredToday,
                baseSalary: driver.baseSalary,
            };
        }) || []
    );

    return NextResponse.json({ drivers });
}
