-- DropForeignKey
ALTER TABLE "Keyword" DROP CONSTRAINT "Keyword_itemId_fkey";

-- CreateTable
CREATE TABLE "_ItemToKeyword" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItemToKeyword_AB_unique" ON "_ItemToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemToKeyword_B_index" ON "_ItemToKeyword"("B");

-- AddForeignKey
ALTER TABLE "_ItemToKeyword" ADD CONSTRAINT "_ItemToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToKeyword" ADD CONSTRAINT "_ItemToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
