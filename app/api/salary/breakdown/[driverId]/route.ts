import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET(req: Request) {
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

    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
            salaryOverrides: true,
        },
    });

    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // 🔍 Get the most recent salary payout
    const lastPayout = await prisma.salaryPayout.findFirst({
        where: { driverId },
        orderBy: { paidAt: "desc" },
    });

    const payouts = await prisma.salaryPayout.findMany({
        where: { driverId },
        orderBy: { paidAt: "desc" },
    });

    const startDate = startOfDay(new Date(driver.joiningDate));

    const today = startOfDay(new Date());
    const dailySalary = Math.round(driver.baseSalary / 30);

    const overridesMap = new Map(
        driver.salaryOverrides.map((o) => [o.date.toISOString().split("T")[0], o.actualPaid])
    );

    const breakdown: { date: string; amount: number; overridden: boolean }[] = [];

    const loopDate = new Date(startDate);
    while (loopDate <= today) {
        const dateStr = loopDate.toISOString().split("T")[0];

        if (overridesMap.has(dateStr)) {
            breakdown.push({
                date: dateStr,
                amount: overridesMap.get(dateStr)!,
                overridden: true,
            });
        } else {
            breakdown.push({
                date: dateStr,
                amount: dailySalary,
                overridden: false,
            });
        }

        loopDate.setDate(loopDate.getDate() + 1);
    }

    return NextResponse.json({
        breakdown,
        payouts,
        lastPayoutDate: lastPayout ? startOfDay(lastPayout.paidAt).toISOString().split("T")[0] : null
    });

}
