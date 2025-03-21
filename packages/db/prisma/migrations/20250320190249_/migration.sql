-- AlterTable
ALTER TABLE "OutputImages" ADD COLUMN     "zipUrl" TEXT;

-- CreateIndex
CREATE INDEX "OutputImages_falAiRequestId_idx" ON "OutputImages"("falAiRequestId");
