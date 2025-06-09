// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding with hashed passwords...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('secureadmin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin2@ctrl.com',
      name: 'Admin Two',
      role: 'ADMIN',
      password: adminPassword,
    },
  });

  const admin = await prisma.admin.create({
    data: {
      userId: adminUser.id,
      company: 'SuperFast Couriers',
      inviteKey: 'ADMIN456',
    },
  });

  console.log("✅ Admin created");

  // 2. Create Drivers
  const shifts = ['MORNING', 'EVENING', 'BOTH'];
  const vehicles = ['BIKE', 'MINI_TRUCK'];
  const drivers = [];

  for (let i = 0; i < 10; i++) {
    const shift = shifts[i % shifts.length];
    const vehicleType = vehicles[i % vehicles.length];
    const password = await bcrypt.hash(`driverpass${i + 1}`, 10);
    const email = `driver${i + 11}@ctrl.com`; // starts at driver11@ctrl.com

    const user = await prisma.user.create({
      data: {
        email,
        name: faker.person.fullName(),
        role: 'DRIVER',
        password,
      },
    });

    const baseSalary =
      vehicleType === 'BIKE'
        ? shift === 'MORNING'
          ? 8000
          : shift === 'EVENING'
          ? 5000
          : 15000
        : shift === 'MORNING'
        ? 12000
        : shift === 'EVENING'
        ? 8000
        : 25000;

    const driver = await prisma.driver.create({
      data: {
        name: user.name,
        vehicleType,
        shift,
        baseSalary,
        joiningDate: new Date('2025-01-01'),
        userId: user.id,
        adminId: admin.id,
      },
    });

    drivers.push({ ...driver, rawPassword: `driverpass${i + 1}`, email });
  }

  console.log("✅ 10 drivers created with hashed passwords");

  // 3. Attendance: June 1–9
  const dateRange = [...Array(9)].map((_, i) => {
    const d = new Date('2025-06-01');
    d.setDate(d.getDate() + i);
    return d;
  });

  for (const driver of drivers) {
    for (const date of dateRange) {
      const shiftArray = driver.shift === 'BOTH' ? ['MORNING', 'EVENING'] : [driver.shift];
      for (const shift of shiftArray) {
        await prisma.attendance.create({
          data: {
            driverId: driver.id,
            date,
            shift,
            active: Math.random() < 0.9,
          },
        });
      }
    }
  }

  console.log("✅ Attendance created");

  // 4. Deliveries
  for (const date of dateRange) {
    for (let i = 0; i < 5; i++) {
      const vehiclePreference = Math.random() < 0.5 ? 'BIKE' : 'MINI_TRUCK';
      const size = vehiclePreference === 'BIKE' ? 'SMALL' : Math.random() < 0.5 ? 'SMALL' : 'LARGE';

      const eligibleDrivers = drivers.filter((d) =>
        d.vehicleType === vehiclePreference &&
        (d.shift === 'BOTH' || (d.shift === 'MORNING' && i % 2 === 0) || (d.shift === 'EVENING' && i % 2 === 1))
      );

      const randomDriver = Math.random() < 0.7 ? faker.helpers.arrayElement(eligibleDrivers) : null;

      await prisma.delivery.create({
        data: {
          description: faker.commerce.productName(),
          address: faker.location.streetAddress(),
          deliveryDate: date,
          timePreference: i % 2 === 0 ? 'MORNING' : 'EVENING',
          vehiclePreference,
          size,
          price: size === 'SMALL'
            ? 50 + Math.floor(Math.random() * 50)
            : 150 + Math.floor(Math.random() * 100),
          assigned: !!randomDriver,
          status: randomDriver
            ? faker.helpers.arrayElement(['NOT_PICKED', 'IN_TRANSIT', 'DELIVERED'])
            : 'NOT_PICKED',
          adminId: admin.id,
          driverId: randomDriver?.id || null,
        },
      });
    }
  }

  console.log("✅ Deliveries created");

  // 5. Daily Salary Overrides
  for (const driver of drivers) {
    const overrideDays = faker.helpers.arrayElements(dateRange, 2);
    for (const day of overrideDays) {
      const perDay = driver.baseSalary / (driver.shift === 'BOTH' ? 30 : 15);
      const paid = Math.round(perDay * (0.6 + Math.random() * 0.4));

      await prisma.dailySalaryOverride.upsert({
        where: {
          driverId_date: {
            driverId: driver.id,
            date: day,
          },
        },
        update: {},
        create: {
          driverId: driver.id,
          date: day,
          actualPaid: paid,
          reason: 'Testing override',
        },
      });
    }
  }

  console.log("✅ Salary overrides added");

  console.log("\n🎉 Seeding complete!\n🧪 Use these credentials for testing:\n");

  console.log("🔐 Admin:");
  console.log("Email: admin2@ctrl.com");
  console.log("Password: secureadmin123\n");

  console.log("👨‍💼 Drivers:");
  drivers.forEach((d, i) => {
    console.log(`${i + 1}. Email: ${d.email} | Password: ${d.rawPassword}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
