/*
  Warnings:

  - Added the required column `resource_type` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "resource_type" TEXT NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL;
