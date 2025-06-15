import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const hashedAdminPass = await bcrypt.hash("superadmin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "adminshow@ctrl.com",
      password: hashedAdminPass,
      name: "Showcase Admin",
      role: "ADMIN",
      admin: {
  create: {
    company: "Demo Logistics Inc",
    inviteKey: "showcase-invite-key",
  },
}
,

    },
  });

  // Driver config presets
  const driverConfigs = [
    { email: "driver101@ctrl.com", vehicle: "BIKE", shift: "MORNING", missed: 0 },
    { email: "driver102@ctrl.com", vehicle: "MINI_TRUCK", shift: "EVENING", missed: 2 },
    { email: "driver103@ctrl.com", vehicle: "BIKE", shift: "BOTH", missed: 0 },
    { email: "driver104@ctrl.com", vehicle: "MINI_TRUCK", shift: "BOTH", missed: 1 },
    { email: "driver105@ctrl.com", vehicle: "BIKE", shift: "MORNING", missed: 3 },
    { email: "driver106@ctrl.com", vehicle: "MINI_TRUCK", shift: "EVENING", missed: 0 },
    { email: "driver107@ctrl.com", vehicle: "BIKE", shift: "EVENING", missed: 1, override: 100 },
    { email: "driver108@ctrl.com", vehicle: "MINI_TRUCK", shift: "BOTH", missed: 0 },
    { email: "driver109@ctrl.com", vehicle: "BIKE", shift: "BOTH", missed: 1 },
    { email: "driver110@ctrl.com", vehicle: "MINI_TRUCK", shift: "MORNING", missed: 0, paid: true },
  ];

  for (let i = 0; i < driverConfigs.length; i++) {
    const cfg = driverConfigs[i];
    const hashedPass = await bcrypt.hash(`driverpass${101 + i}`, 10);

    const userWithDriver = await prisma.user.create({
  data: {
    email: cfg.email,
    password: hashedPass,
    name: `Driver ${101 + i}`,
    role: "DRIVER",
    driver: {
      create: {
        vehicleType: cfg.vehicle,
        shiftPreference: cfg.shift,
        adminId: adminUser.admin.id,
        joiningDate: subDays(new Date(), 20),
      },
    },
  },
  include: {
    driver: true,
  },
});

const driver = userWithDriver.driver;


    // Create attendance records (20 days total)
    for (let d = 0; d < 20; d++) {
      const day = subDays(new Date(), d);
      if (cfg.missed && d < cfg.missed) continue;

      await prisma.attendance.create({
        data: {
          driverId: driver.id,
          date: day,
          shift: cfg.shift === "BOTH" ? (d % 2 === 0 ? "MORNING" : "EVENING") : cfg.shift,
          status: "ACTIVE",
        },
      });
    }

    // Salary override if defined
    if (cfg.override) {
      await prisma.salaryOverride.create({
        data: {
          driverId: driver.id,
          date: subDays(new Date(), 1),
          amount: cfg.override,
        },
      });
    }

    // Payout history if marked
    if (cfg.paid) {
      await prisma.salaryPayout.create({
        data: {
          driverId: driver.id,
          payoutDate: subDays(new Date(), 2),
        },
      });
    }
  }

  // Create random deliveries
  const allDrivers = await prisma.driver.findMany();

  for (let i = 0; i < 30; i++) {
    const driver = allDrivers[i % allDrivers.length];
    const sizes = ["SMALL", "LARGE"];
    const shifts = ["MORNING", "EVENING"];
    const statuses = ["NOT_PICKED", "IN_TRANSIT", "DELIVERED"];

    await prisma.delivery.create({
      data: {
        description: `Delivery #${i + 1}`,
        address: `Block ${String.fromCharCode(65 + (i % 5))}, Street ${i + 10}`,
        size: sizes[i % 2],
        timePreference: shifts[i % 2],
        vehiclePreference: driver.vehicleType,
        price: 50 + (i % 5) * 10,
        status: statuses[i % 3],
        deliveryDate: addDays(new Date(), i % 3),
        driverId: driver.id,
        adminId: adminUser.admin.id,
      },
    });
  }

  console.log("✅ Seed completed with Admin, 10 Drivers, Deliveries, Attendance, Salary");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
