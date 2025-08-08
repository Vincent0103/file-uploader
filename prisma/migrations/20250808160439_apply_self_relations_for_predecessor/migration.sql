/*
  Warnings:

  - You are about to drop the column `successorId` on the `Entity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[predecessorId]` on the table `Entity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Entity" DROP CONSTRAINT "Entity_successorId_fkey";

-- DropIndex
DROP INDEX "public"."Entity_successorId_key";

-- AlterTable
ALTER TABLE "public"."Entity" DROP COLUMN "successorId",
ADD COLUMN     "predecessorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Entity_predecessorId_key" ON "public"."Entity"("predecessorId");

-- AddForeignKey
ALTER TABLE "public"."Entity" ADD CONSTRAINT "Entity_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "public"."Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
