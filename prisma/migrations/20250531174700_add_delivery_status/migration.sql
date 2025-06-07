-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_PICKED', 'PICKED', 'IN_TRANSIT', 'DELIVERED');

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "status" "DeliveryStatus" NOT NULL DEFAULT 'NOT_PICKED';
