-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_entityId_fkey";

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
