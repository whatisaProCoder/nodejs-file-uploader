/*
  Warnings:

  - You are about to drop the column `created_at` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Folder` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Folder_name_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
