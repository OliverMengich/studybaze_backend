/*
  Warnings:

  - Added the required column `bundleId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "bundleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DocumentBundle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentBundle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "DocumentBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
