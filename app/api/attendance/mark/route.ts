// app/api/attendance/mark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "DRIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { shift } = body;

        if (!shift || !["MORNING", "EVENING"].includes(shift)) {
            return NextResponse.json({ error: "Invalid shift provided" }, { status: 400 });
        }

        const driver = await prisma.driver.findUnique({
            where: { userId: session.user.id },
        });

        if (!driver) {
            return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        const existing = await prisma.attendance.findFirst({
            where: {
                driverId: driver.id,
                shift,
                date: today,
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Already marked attendance for this shift" }, { status: 409 });
        }

        await prisma.attendance.create({
            data: {
                shift,
                date: today,
                active: true,
                driverId: driver.id,
            },
        });

        return NextResponse.json({ success: true, message: `Marked ${shift} attendance` });
    } catch (error) {
        console.error("Attendance Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
