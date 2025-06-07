// app/api/driver/update-profile/route.ts
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
        const { vehicleType, shift } = body;

        // Calculate new base salary
        let baseSalary = 0;

        if (vehicleType === "BIKE") {
            if (shift === "BOTH") baseSalary = 15000;
            else if (shift === "MORNING") baseSalary = 8000;
            else if (shift === "EVENING") baseSalary = 5000;
        } else if (vehicleType === "MINI_TRUCK") {
            if (shift === "BOTH") baseSalary = 25000;
            else if (shift === "MORNING") baseSalary = 12000;
            else if (shift === "EVENING") baseSalary = 8000;
        }

        const updated = await prisma.driver.update({
            where: {
                userId: session.user.id,
            },
            data: {
                vehicleType,
                shift,
                baseSalary,
            },
        });

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
