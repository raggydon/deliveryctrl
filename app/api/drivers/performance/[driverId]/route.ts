import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const driverId = segments[segments.length - 1];

    if (!driverId) {
        return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
            deliveries: true,
            attendances: true,
        },
    });

    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // ✅ Cumulative delivery success rate (from joining till now)
    const totalAssigned = driver.deliveries.length;
    const totalDelivered = driver.deliveries.filter(
        (d) => d.status === "DELIVERED"
    ).length;

    const successRate =
        totalAssigned > 0 ? (totalDelivered / totalAssigned) * 100 : null;

    // ✅ Attendance rate
    const daysSinceJoining =
        (new Date().getTime() - new Date(driver.joiningDate).getTime()) / (1000 * 60 * 60 * 24);

    const uniqueAttendanceDays = new Set(
        driver.attendances
            .filter((a) => a.active)
            .map((a) => new Date(a.date).toDateString())
    );

    const attendanceRate =
        daysSinceJoining > 0
            ? (uniqueAttendanceDays.size / Math.ceil(daysSinceJoining)) * 100
            : null;

    return NextResponse.json({
        successRate,
        attendanceRate,
    });
}
