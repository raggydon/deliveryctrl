import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
        include: { salaryOverrides: true },
    });

    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(driver.joiningDate);
    if (driver.lastSalaryPayout) {
        startDate = new Date(driver.lastSalaryPayout);
        startDate.setDate(startDate.getDate() + 1); // start the next day
    }
    startDate.setHours(0, 0, 0, 0);

    const dailySalary = Math.round(driver.baseSalary / 30);
    const overridesMap = new Map(
        driver.salaryOverrides.map((o) => [o.date.toDateString(), o.actualPaid])
    );

    let total = 0;
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const key = d.toDateString();
        total += overridesMap.has(key)
            ? overridesMap.get(key)!
            : dailySalary;
    }

    return NextResponse.json({ totalPayable: total });
}
