import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const driverId = params.id;

    if (!driverId) {
        return NextResponse.json({ error: "Missing driverId" }, { status: 400 });
    }

    try {
        const driver = await prisma.driver.delete({
            where: { id: driverId },
        });

        return NextResponse.json({ message: "Driver permanently deleted", driver });
    } catch (error) {
        return NextResponse.json({ error: "Driver not found or error occurred" }, { status: 500 });
    }
}
k