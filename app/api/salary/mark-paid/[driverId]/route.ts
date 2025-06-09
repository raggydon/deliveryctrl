import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const driverId = segments[segments.length - 1];

    if (!driverId) {
        return NextResponse.json({ error: "Driver ID missing" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const lastPayout = await prisma.salaryPayout.findFirst({
        where: { driverId },
        orderBy: { paidAt: "desc" },
    });

    const startDate = lastPayout ? new Date(lastPayout.paidAt) : new Date(driver.joiningDate);
    startDate.setDate(startDate.getDate() + 1); // Start from next day
    startDate.setHours(0, 0, 0, 0);
    const today = startOfDay(new Date());

    const overrides = await prisma.dailySalaryOverride.findMany({
        where: { driverId },
    });

    const overrideMap = new Map<string, number>();
    overrides.forEach((o) => {
        const key = o.date.toISOString().split("T")[0];
        overrideMap.set(key, o.actualPaid);
    });

    const dailyDefault = Math.round(driver.baseSalary / 30);
    let totalUnpaid = 0;
    const date = new Date(startDate);

    while (date <= today) {
        const key = date.toISOString().split("T")[0];
        const overriddenAmount = overrideMap.get(key);
        const dayAmount = overriddenAmount ?? dailyDefault;
        totalUnpaid += dayAmount;
        date.setDate(date.getDate() + 1);
    }

    if (totalUnpaid === 0) {
        return NextResponse.json({ message: "Nothing to mark as paid." });
    }

    const now = new Date();

    await prisma.salaryPayout.create({
        data: {
            driverId,
            totalAmount: totalUnpaid,
            paidAt: now,
        },
    });

    await prisma.driver.update({
        where: { id: driverId },
        data: {
            lastSalaryPayout: now,
        },
    });

    return NextResponse.json({
        message: "Salary marked as paid.",
        totalPaid: totalUnpaid,
        paidAt: now,
    });
}
