/*
  Warnings:

  - A unique constraint covering the columns `[contact_email]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact_email]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contact_email` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_email` on table `suppliers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "contact_email" SET NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "contact_email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_contact_email_key" ON "clients"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_contact_email_key" ON "suppliers"("contact_email");
