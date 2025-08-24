/*
  Warnings:

  - You are about to drop the column `storagePath` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "storagePath";
