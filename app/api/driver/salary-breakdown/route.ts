// app/api/driver/salary-breakdown/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DRIVER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
        where: { userId: session.user.id },
    });

    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const breakdown = await prisma.dailySalaryOverride.findMany({
        where: {
            driverId: driver.id,
        },
        orderBy: { date: "asc" },
    });


    const monthlyBase = driver.baseSalary / 30;

    const allDates: Date[] = [];
    const current = new Date(driver.joiningDate);
    const today = new Date();

    while (current <= today) {
        allDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    const salaryMap = new Map<string, { amount: number; overridden: boolean }>();

    for (const d of allDates) {
        const key = d.toISOString().split("T")[0];
        salaryMap.set(key, { amount: Math.round(monthlyBase), overridden: false });
    }

    for (const adj of breakdown) {
        const key = adj.date.toISOString().split("T")[0];
        salaryMap.set(key, {
            amount: adj.actualPaid,
            overridden: true,
        });
    }


    const final = [...salaryMap.entries()].map(([date, { amount, overridden }]) => ({
        date,
        amount,
        overridden,
    }));

    return NextResponse.json({ breakdown: final });
}
