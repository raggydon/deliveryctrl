// app/api/deliveries/today/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
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

        const deliveries = await prisma.delivery.findMany({
            where: {
                driverId: driver.id,
            },
            orderBy: {
                deliveryDate: "asc",
            },
        });

        return NextResponse.json({ deliveries });
    } catch (error) {
        console.error("[GET_DRIVER_DELIVERIES]", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
