import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "DRIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status, failureReason } = await req.json();

        // Validate status value
        const allowedStatuses = ["IN_TRANSIT", "DELIVERED", "FAILED_ATTEMPT"];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Validate failureReason usage
        if (status === "FAILED_ATTEMPT" && (!failureReason || failureReason.trim() === "")) {
            return NextResponse.json({ error: "Failure reason is required for FAILED_ATTEMPT" }, { status: 400 });
        }

        if (status !== "FAILED_ATTEMPT" && failureReason) {
            return NextResponse.json({ error: "Failure reason should only be provided for FAILED_ATTEMPT" }, { status: 400 });
        }

        const updated = await prisma.delivery.update({
            where: { id: params.id },
            data: {
                status,
                failureReason: status === "FAILED_ATTEMPT" ? failureReason : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH_DELIVERY_STATUS]", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
