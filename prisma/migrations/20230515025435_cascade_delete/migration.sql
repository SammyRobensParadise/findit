-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_collectionId_fkey`;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
