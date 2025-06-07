// app/api/delivery/[id]/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({
            where: { userId: session.user.id },
        });

        if (!admin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        const deliveryId = params.id;
        const { driverId } = await req.json();

        const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId },
        });

        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Check if this admin owns the delivery
        if (delivery.adminId !== admin.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Assign the driver
        await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                driverId,
                assigned: true,
            },
        });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/deliveries`);
    } catch (err) {
        console.error("Assignment error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
