-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'FAILED_ATTEMPT';

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "failureReason" TEXT;
