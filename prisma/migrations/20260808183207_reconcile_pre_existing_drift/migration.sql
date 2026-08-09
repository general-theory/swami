-- AlterTable
ALTER TABLE `Game` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `providerGameId` INTEGER NULL,
    MODIFY `venue` varchar(191) NULL;

-- AlterTable
ALTER TABLE `Team` ADD COLUMN `rank` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `favTeamId` VARCHAR(191) NULL,
    MODIFY `firstName` varchar(191) NULL,
    MODIFY `lastName` varchar(191) NULL;

-- CreateTable
CREATE TABLE `EmailReminder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmailReminder_sentAt_idx`(`sentAt` ASC),
    INDEX `EmailReminder_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wager` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,
    `leagueId` INTEGER NOT NULL,
    `pick` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `won` BOOLEAN NULL,
    `balanceImpact` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Wager_gameId_idx`(`gameId` ASC),
    INDEX `Wager_leagueId_idx`(`leagueId` ASC),
    UNIQUE INDEX `Wager_userId_gameId_leagueId_key`(`userId` ASC, `gameId` ASC, `leagueId` ASC),
    INDEX `Wager_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Game_providerGameId_idx` ON `Game`(`providerGameId` ASC);

-- CreateIndex
CREATE INDEX `User_favTeamId_idx` ON `User`(`favTeamId` ASC);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_favTeamId_fkey` FOREIGN KEY (`favTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wager` ADD CONSTRAINT `Wager_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wager` ADD CONSTRAINT `Wager_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wager` ADD CONSTRAINT `Wager_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
