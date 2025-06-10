import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import formidable, { IncomingForm } from "formidable";
import fs from "fs";
import { promisify } from "util";
import * as xlsx from "xlsx";
import { PackageSize, VehicleType, Shift, DeliveryStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: false,
    },
};

const readFile = promisify(fs.readFile);

const calculatePrice = (
    size: PackageSize,
    vehicle: VehicleType,
    shift: Shift
): number => {
    if (size === "SMALL" && vehicle === "BIKE") {
        return shift === "MORNING" ? 50 : 45;
    }
    if (size === "LARGE" && vehicle === "MINI_TRUCK") {
        return shift === "MORNING" ? 120 : 100;
    }
    return 60;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
    });

    if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
    }

    const form = new IncomingForm({ keepExtensions: true });

    const data: { fields: any; files: any } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });

    const file = data.files?.file?.[0] || data.files?.file;
    if (!file || !file.filepath) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = await readFile(file.filepath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = xlsx.utils.sheet_to_json(sheet, {
        range: 2,
        defval: "",
    });

    const deliveriesToCreate = [];
    const errors = [];

    for (let i = 0; i < json.length; i++) {
        const row = json[i] as Record<string, any>;
        const rowNum = i + 4;

        const {
            description,
            address,
            size,
            vehiclePreference,
            timePreference,
            deliveryDate,
        } = row;

        if (
            !description ||
            !address ||
            !size ||
            !vehiclePreference ||
            !timePreference ||
            !deliveryDate
        ) {
            errors.push({ row: rowNum, error: "Missing required fields" });
            continue;
        }

        const sizeVal = size.toUpperCase();
        const vehicleVal = vehiclePreference.toUpperCase();
        const shiftVal = timePreference.toUpperCase();

        const validSize = ["SMALL", "LARGE"].includes(sizeVal);
        const validVehicle = ["BIKE", "MINI_TRUCK"].includes(vehicleVal);
        const validShift = ["MORNING", "EVENING"].includes(shiftVal);

        if (!validSize || !validVehicle || !validShift) {
            errors.push({ row: rowNum, error: "Invalid dropdown value(s)" });
            continue;
        }

        let parsedDate: Date;
        try {
            parsedDate = new Date(deliveryDate);
            if (isNaN(parsedDate.getTime())) throw new Error();

            // ✅ Fix: increment by 1 day
            parsedDate.setDate(parsedDate.getDate() + 1);
        } catch {
            errors.push({ row: rowNum, error: "Invalid delivery date" });
            continue;
        }

        const price = calculatePrice(
            sizeVal as PackageSize,
            vehicleVal as VehicleType,
            shiftVal as Shift
        );

        deliveriesToCreate.push({
            description,
            address,
            size: sizeVal as PackageSize,
            vehiclePreference: vehicleVal as VehicleType,
            timePreference: shiftVal as Shift,
            deliveryDate: parsedDate,
            price,
            assigned: false,
            status: "NOT_PICKED" as DeliveryStatus,
            adminId: admin.id,
        });
    }

    if (deliveriesToCreate.length > 0) {
        await prisma.delivery.createMany({
            data: deliveriesToCreate,
        });
    }

    return res.status(200).json({
        successCount: deliveriesToCreate.length,
        errorCount: errors.length,
        errors,
    });
}
