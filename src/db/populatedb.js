import { PrismaClient } from "@prisma/client";
import db from "./queries";

const prisma = new PrismaClient();

const main = async () => {
  // await prisma.user.deleteMany();
  // await db.createFolder(3, "home", "/");
  // await db.createFolder(3, "documents", "/home/", 27);
  // await db.createFolder(3, "images", "/home/", 27);
  // await db.createFolder(3, "videos", "/home/", 27);
  // await db.createFolder(3, "music", "/home/", 27);
  const folders = await prisma.entity.findMany();
  console.log(folders);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
