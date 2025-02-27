-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_bundleId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "bundleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "DocumentBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
