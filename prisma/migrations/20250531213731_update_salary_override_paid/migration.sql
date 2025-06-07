/*
  Warnings:

  - You are about to drop the column `amount` on the `DailySalaryOverride` table. All the data in the column will be lost.
  - Added the required column `actualPaid` to the `DailySalaryOverride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailySalaryOverride" DROP COLUMN "amount",
ADD COLUMN     "actualPaid" INTEGER NOT NULL;
