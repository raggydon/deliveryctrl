// app/api/delivery/status/[id]/route.ts
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

        const { status } = await req.json();

        const updated = await prisma.delivery.update({
            where: { id: params.id },
            data: {
                status,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH_DELIVERY_STATUS]", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
