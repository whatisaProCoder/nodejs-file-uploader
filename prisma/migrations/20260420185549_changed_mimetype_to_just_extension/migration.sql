/*
  Warnings:

  - You are about to drop the column `mimetype` on the `File` table. All the data in the column will be lost.
  - Added the required column `ext` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "mimetype",
ADD COLUMN     "ext" VARCHAR(50) NOT NULL;
