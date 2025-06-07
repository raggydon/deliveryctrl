// app/api/auth/sign-up/route.ts
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received body:", body);

        const { name, email, password, role, inviteKey } = body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        if (role === "ADMIN") {
            await prisma.admin.create({
                data: {
                    company: `${name}'s Company`,
                    userId: user.id,
                    inviteKey: crypto.randomUUID().slice(0, 8),
                },
            });
        } else if (role === "DRIVER") {
            const admin = await prisma.admin.findUnique({ where: { inviteKey } });

            if (!admin) {
                return NextResponse.json({ message: "Invalid invite key" }, { status: 400 });
            }

            await prisma.driver.create({
                data: {
                    name,
                    userId: user.id,
                    adminId: admin.id,
                    vehicleType: "BIKE",
                    shift: "MORNING",
                    baseSalary: 8000,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Sign-up Error:", err); // 🔥 this will help
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
