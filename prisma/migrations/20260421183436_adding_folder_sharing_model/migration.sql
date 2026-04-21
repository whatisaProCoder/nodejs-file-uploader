-- CreateTable
CREATE TABLE "FolderShare" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "folderID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FolderShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderID_fkey" FOREIGN KEY ("folderID") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
