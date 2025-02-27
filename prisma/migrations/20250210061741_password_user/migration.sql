/*
  Warnings:

  - Added the required column `categoryId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `downloadsCount` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pages` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail_image` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "downloadsCount" INTEGER NOT NULL,
ADD COLUMN     "pages" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "thumbnail_image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "DocumentCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DocumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
