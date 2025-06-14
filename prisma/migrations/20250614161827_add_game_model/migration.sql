-- AlterTable
ALTER TABLE `userparticipation` ADD COLUMN `maxBet` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `minBet` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `conference` VARCHAR(191) NOT NULL,
    `mascot` VARCHAR(191) NOT NULL,
    `abbreviation` VARCHAR(191) NOT NULL,
    `division` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Team_providerId_key`(`providerId`),
    UNIQUE INDEX `Team_abbreviation_key`(`abbreviation`),
    INDEX `Team_providerId_idx`(`providerId`),
    INDEX `Team_name_idx`(`name`),
    INDEX `Team_conference_idx`(`conference`),
    INDEX `Team_division_idx`(`division`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Week` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` INTEGER NOT NULL,
    `week` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `wagersAllowed` BOOLEAN NOT NULL DEFAULT false,
    `wagersCutoff` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `activeSync` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Week_seasonId_idx`(`seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` INTEGER NOT NULL,
    `weekId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `neutralSite` BOOLEAN NOT NULL DEFAULT false,
    `homeId` VARCHAR(191) NOT NULL,
    `homePoints` INTEGER NULL,
    `spread` DOUBLE NULL,
    `startingSpread` DOUBLE NULL,
    `awayId` VARCHAR(191) NOT NULL,
    `awayPoints` INTEGER NULL,
    `resultId` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Game_seasonId_idx`(`seasonId`),
    INDEX `Game_weekId_idx`(`weekId`),
    INDEX `Game_homeId_idx`(`homeId`),
    INDEX `Game_awayId_idx`(`awayId`),
    INDEX `Game_resultId_idx`(`resultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Week` ADD CONSTRAINT `Week_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_homeId_fkey` FOREIGN KEY (`homeId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_awayId_fkey` FOREIGN KEY (`awayId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
