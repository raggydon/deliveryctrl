-- CreateEnum
CREATE TYPE "PackageSize" AS ENUM ('SMALL', 'LARGE');

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "size" "PackageSize" NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "timePreference" "Shift" NOT NULL,
    "vehiclePreference" "VehicleType" NOT NULL,
    "price" INTEGER NOT NULL,
    "assigned" BOOLEAN NOT NULL DEFAULT false,
    "adminId" TEXT NOT NULL,
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
