/*
  Warnings:

  - A unique constraint covering the columns `[fileID,userID]` on the table `FileShare` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[folderID,userID]` on the table `FolderShare` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FileShare_fileID_userID_key" ON "FileShare"("fileID", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "FolderShare_folderID_userID_key" ON "FolderShare"("folderID", "userID");
