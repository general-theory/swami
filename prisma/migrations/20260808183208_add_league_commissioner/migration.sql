-- CreateTable
CREATE TABLE `leaguecommissioner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leagueId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LeagueCommissioner_leagueId_idx`(`leagueId` ASC),
    UNIQUE INDEX `LeagueCommissioner_leagueId_userId_key`(`leagueId` ASC, `userId` ASC),
    INDEX `LeagueCommissioner_userId_idx`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leaguecommissioner` ADD CONSTRAINT `LeagueCommissioner_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `league`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaguecommissioner` ADD CONSTRAINT `LeagueCommissioner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

