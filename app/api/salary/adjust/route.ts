import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { driverId, amount, reason } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const override = await prisma.dailySalaryOverride.upsert({
            where: {
                driverId_date: {
                    driverId,
                    date: today,
                },
            },
            update: { actualPaid: amount, reason },
            create: { driverId, date: today, actualPaid: amount, reason },
        });

        return NextResponse.json({ success: true, override });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to adjust salary" }, { status: 500 });
    }
}
