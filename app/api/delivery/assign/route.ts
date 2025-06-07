// app/api/delivery/assign/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.formData();
        const deliveryId = data.get("deliveryId") as string;
        const driverId = data.get("driverId") as string;

        if (!deliveryId || !driverId) {
            return NextResponse.json({ error: "Missing delivery or driver ID" }, { status: 400 });
        }

        const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
            return NextResponse.json({ error: "Driver not found" }, { status: 404 });
        }

        // Optional: Check eligibility again on backend here if needed

        await prisma.delivery.update({
            where: { id: deliveryId },
            data: { driverId },
        });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/deliveries`);
    } catch (err) {
        console.error("[ASSIGN_DRIVER_ERROR]", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
