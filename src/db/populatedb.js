import mime from "mime-types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  console.log(mime.extension("image/jpeg"));
  // await prisma.file.deleteMany();
  // await prisma.entity.deleteMany();
  // await prisma.user.deleteMany();
  // await db.createFolder(3, "home", "/");
  // await db.createFolder(3, "documents", "/home/", 27);
  // await db.createFolder(3, "images", "/home/", 27);
  // await db.createFolder(3, "videos", "/home/", 27);
  // await db.createFolder(3, "music", "/home/", 27);
  // const folders = await prisma.entity.findMany();
  // const folderExists = await db.doesFolderExistsInPath(6, "music", 42);
  // console.log(folderExists);
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
