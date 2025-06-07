import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

        const deliveries = await prisma.delivery.findMany({
            where: { adminId: admin.id },
            include: {
                driver: {
                    select: {
                        name: true,
                        vehicleType: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ deliveries }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch deliveries:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
