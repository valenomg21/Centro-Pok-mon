-- AlterTable
ALTER TABLE `pokemonpaciente` ADD COLUMN `efecto` VARCHAR(191) NOT NULL DEFAULT 'ninguno',
    ADD COLUMN `shiny` BOOLEAN NOT NULL DEFAULT false;
