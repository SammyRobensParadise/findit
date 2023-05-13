/*
  Warnings:

  - Made the column `description` on table `Collection` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Collection` MODIFY `name` TEXT NOT NULL,
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Item` MODIFY `name` TEXT NOT NULL,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Keyword` MODIFY `name` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `name` TEXT NULL;
