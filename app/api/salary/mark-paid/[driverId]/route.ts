import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    try {
        const updated = await prisma.driver.update({
            where: { id: driverId },
            data: {
                lastSalaryPayout: new Date(),
            },
        });

        return NextResponse.json({
            message: "Salary marked as paid.",
            lastSalaryPayout: updated.lastSalaryPayout,
        });
    } catch (error) {
        console.error("Mark salary paid failed:", error);
        return NextResponse.json(
            { error: "Failed to mark salary as paid." },
            { status: 500 }
        );
    }
}
