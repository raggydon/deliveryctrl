// app/api/delivery/eligible-drivers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryId = req.nextUrl.searchParams.get("deliveryId");
    if (!deliveryId) {
        return NextResponse.json({ error: "Missing deliveryId" }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
    });

    if (!delivery) {
        return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
        include: { drivers: true },
    });

    if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Get deliveries on the same date
    const deliveriesOnDate = await prisma.delivery.findMany({
        where: { deliveryDate: delivery.deliveryDate },
        select: { driverId: true, size: true },
    });

    // Map: driverId -> number of deliveries by size
    const driverLoad = new Map<string, { small: number; total: number }>();

    deliveriesOnDate.forEach((d) => {
        if (!d.driverId) return;
        if (!driverLoad.has(d.driverId)) {
            driverLoad.set(d.driverId, { small: 0, total: 0 });
        }
        const load = driverLoad.get(d.driverId)!;
        if (d.size === "SMALL") load.small += 1;
        load.total += 1;
    });

    const eligibleDrivers = admin.drivers.filter((driver) => {
        const load = driverLoad.get(driver.id) ?? { small: 0, total: 0 };

        // LARGE packages → only mini trucks with < 40 deliveries
        if (delivery.size === "LARGE") {
            return (
                driver.vehicleType === "MINI_TRUCK" && load.total < 40
            );
        }

        // SMALL packages → bike (<25) or mini truck (<40)
        if (driver.vehicleType === "BIKE") {
            return load.small < 25;
        } else {
            return load.total < 40;
        }
    });

    return NextResponse.json({ drivers: eligibleDrivers });
}
