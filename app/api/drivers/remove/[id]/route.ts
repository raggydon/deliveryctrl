import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ async second argument destructure
export async function DELETE(
    req: Request,
    context: { params: { id: string } }
) {
    const driverId = context.params.id;

    if (!driverId) {
        return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
    }

    try {
        // 1. Delete all related attendances
        await prisma.attendance.deleteMany({
            where: { driverId },
        });

        // 2. Delete salary overrides
        await prisma.dailySalaryOverride.deleteMany({
            where: { driverId },
        });

        // 3. Delete salary payouts
        await prisma.salaryPayout.deleteMany({
            where: { driverId },
        });

        // 4. Set driverId to null in deliveries (if optional)
        await prisma.delivery.updateMany({
            where: { driverId },
            data: { driverId: null }, // if driver is nullable
        });

        // 5. Finally, delete the driver
        const driver = await prisma.driver.delete({
            where: { id: driverId },
        });

        return NextResponse.json({ message: "Driver and related data deleted", driver });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Error occurred while deleting driver" }, { status: 500 });
    }
}
