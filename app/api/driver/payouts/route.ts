// app/api/driver/payouts/route.ts

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

    const payouts = await prisma.salaryPayout.findMany({
        where: {
            driverId: driver.id,
        },
        orderBy: { paidAt: "desc" },
    });

    return NextResponse.json({ payouts });
}
