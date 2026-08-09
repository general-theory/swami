-- AlterTable
ALTER TABLE `UserParticipation` ADD COLUMN `isLock` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `LockPick` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leagueId` INTEGER NOT NULL,
    `weekId` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,
    `pick` VARCHAR(191) NOT NULL,
    `wagerId` INTEGER NULL,
    `setByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LockPick_wagerId_key`(`wagerId`),
    INDEX `LockPick_leagueId_idx`(`leagueId`),
    INDEX `LockPick_weekId_idx`(`weekId`),
    INDEX `LockPick_gameId_idx`(`gameId`),
    UNIQUE INDEX `LockPick_leagueId_weekId_key`(`leagueId`, `weekId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LockPick` ADD CONSTRAINT `LockPick_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LockPick` ADD CONSTRAINT `LockPick_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LockPick` ADD CONSTRAINT `LockPick_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LockPick` ADD CONSTRAINT `LockPick_wagerId_fkey` FOREIGN KEY (`wagerId`) REFERENCES `Wager`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LockPick` ADD CONSTRAINT `LockPick_setByUserId_fkey` FOREIGN KEY (`setByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
