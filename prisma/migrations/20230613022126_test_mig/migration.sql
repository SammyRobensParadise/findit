/*
  Warnings:

  - You are about to drop the `UserOnCollection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserOnCollection" DROP CONSTRAINT "UserOnCollection_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnCollection" DROP CONSTRAINT "UserOnCollection_userId_fkey";

-- DropTable
DROP TABLE "UserOnCollection";

-- CreateTable
CREATE TABLE "_CollectionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToUser_AB_unique" ON "_CollectionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToUser_B_index" ON "_CollectionToUser"("B");

-- AddForeignKey
ALTER TABLE "_CollectionToUser" ADD CONSTRAINT "_CollectionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToUser" ADD CONSTRAINT "_CollectionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
