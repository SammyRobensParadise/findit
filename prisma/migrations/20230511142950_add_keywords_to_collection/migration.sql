-- AlterTable
ALTER TABLE "Keyword" ADD COLUMN     "collectionId" TEXT;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
