/*
  Warnings:

  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PAYMENT_METHOD" AS ENUM ('STRIPE', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
ADD COLUMN     "method" "PAYMENT_METHOD" NOT NULL;

-- CreateTable
CREATE TABLE "AllowedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDomain_domain_key" ON "AllowedDomain"("domain");

-- CreateIndex
CREATE INDEX "AllowedDomain_domain_idx" ON "AllowedDomain"("domain");

-- CreateIndex
CREATE INDEX "AllowedDomain_isActive_idx" ON "AllowedDomain"("isActive");
