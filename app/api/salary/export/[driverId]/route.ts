import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Parser } from "json2csv";

export async function GET(
    req: Request,
    context: { params: { driverId: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driverId = context.params.driverId;

    const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
            salaryOverrides: true,
        },
    });

    if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format");

    const startDate = driver.lastSalaryPayout || driver.joiningDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySalary = Math.round(driver.baseSalary / 30);
    const overridesMap = new Map(
        driver.salaryOverrides.map((o) => [o.date.toDateString(), o.actualPaid])
    );

    const details: { date: string; amount: number; override: boolean }[] = [];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const key = d.toDateString();
        const paid = overridesMap.get(key);

        if (paid != null) {
            details.push({ date: key, amount: paid, override: true });
        } else {
            details.push({ date: key, amount: dailySalary, override: false });
        }
    }

    const totalEarned = details.reduce((sum, day) => sum + day.amount, 0);

    if (format === "csv") {
        const parser = new Parser({ fields: ["date", "amount", "override"] });
        const csv = parser.parse(details);
        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="salary_${driver.name}_${new Date()
                    .toISOString()
                    .split("T")[0]}.csv"`,
            },
        });
    }

    return NextResponse.json({
        driverId,
        from: startDate,
        to: today,
        totalEarned,
        days: details,
    });
}
