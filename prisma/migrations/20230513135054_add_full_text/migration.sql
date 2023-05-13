-- CreateIndex
CREATE FULLTEXT INDEX `Item_name_idx` ON `Item`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Item_description_idx` ON `Item`(`description`);

-- CreateIndex
CREATE FULLTEXT INDEX `Item_name_description_idx` ON `Item`(`name`, `description`);

-- CreateIndex
CREATE FULLTEXT INDEX `Keyword_name_idx` ON `Keyword`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `User_name_idx` ON `User`(`name`);
