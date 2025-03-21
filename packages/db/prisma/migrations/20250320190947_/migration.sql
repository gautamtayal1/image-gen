/*
  Warnings:

  - You are about to drop the column `zipUrl` on the `OutputImages` table. All the data in the column will be lost.
  - You are about to drop the `TrainingImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrainingImages" DROP CONSTRAINT "TrainingImages_modelId_fkey";

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "zipUrl" TEXT;

-- AlterTable
ALTER TABLE "OutputImages" DROP COLUMN "zipUrl";

-- DropTable
DROP TABLE "TrainingImages";
