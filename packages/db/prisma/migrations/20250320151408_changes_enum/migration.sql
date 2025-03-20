/*
  Warnings:

  - The values [AsianAmerican,EastAsian,SouthEastAsian,SouthAsian,MiddleEastern] on the enum `EthinicityEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EthinicityEnum_new" AS ENUM ('White', 'Black', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic');
ALTER TABLE "Model" ALTER COLUMN "ethinicity" TYPE "EthinicityEnum_new" USING ("ethinicity"::text::"EthinicityEnum_new");
ALTER TYPE "EthinicityEnum" RENAME TO "EthinicityEnum_old";
ALTER TYPE "EthinicityEnum_new" RENAME TO "EthinicityEnum";
DROP TYPE "EthinicityEnum_old";
COMMIT;
