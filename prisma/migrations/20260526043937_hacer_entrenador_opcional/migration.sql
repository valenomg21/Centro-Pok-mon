-- DropForeignKey
ALTER TABLE `pokemonpaciente` DROP FOREIGN KEY `PokemonPaciente_entrenadorId_fkey`;

-- DropIndex
DROP INDEX `PokemonPaciente_entrenadorId_fkey` ON `pokemonpaciente`;

-- AlterTable
ALTER TABLE `pokemonpaciente` MODIFY `entrenadorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PokemonPaciente` ADD CONSTRAINT `PokemonPaciente_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `Entrenador`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
