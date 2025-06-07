import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const {
            description,
            address,
            size,
            timePreference,
            deliveryDate,
            vehiclePreference,
            price,
        } = body;

        const delivery = await prisma.delivery.create({
            data: {
                description,
                address,
                size,
                timePreference,
                deliveryDate: new Date(deliveryDate),
                vehiclePreference,
                price,
                adminId: admin.id,
            },
        });

        return NextResponse.json({ success: true, delivery }, { status: 201 });
    } catch (error) {
        console.error("Error creating delivery:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
