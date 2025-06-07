import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const driverId = formData.get("driverId") as string;

        if (!driverId) {
            return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
        }

        const delivery = await prisma.delivery.update({
            where: { id: params.id },
            data: {
                driverId,
                assigned: true,
            },
        });

        return NextResponse.redirect(new URL("/admin/deliveries", req.url));
    } catch (error) {
        console.error("Error assigning delivery:", error);
        return NextResponse.json({ error: "Failed to assign delivery" }, { status: 500 });
    }
}
