/*
  Warnings:

  - You are about to drop the `DeliveryOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryDeduction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeliveryOrder" DROP CONSTRAINT "DeliveryOrder_assignedDriverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverActivity" DROP CONSTRAINT "DriverActivity_driverId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryDeduction" DROP CONSTRAINT "SalaryDeduction_driverId_fkey";

-- DropTable
DROP TABLE "DeliveryOrder";

-- DropTable
DROP TABLE "DriverActivity";

-- DropTable
DROP TABLE "SalaryDeduction";

-- DropEnum
DROP TYPE "DeliveryStatus";

-- DropEnum
DROP TYPE "PackageSize";
