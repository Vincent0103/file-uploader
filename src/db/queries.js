import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = (() => {
  const prisma = new PrismaClient();

  const createUser = async (userData) => {
    const { username, password: unhashedPassword } = userData;
    console.log(username, unhashedPassword);
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(unhashedPassword, salt);

    await prisma.user.create({
      data: {
        username,
        password,
      },
    });
  };

  const getUserByUsername = async (username) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  };

  const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  };

  const hasUserByUsername = async (username) => {
    const user = await getUserByUsername(username);
    return !!user;
  };

  const createFolder = async (userId, filename, path, folderParentId) => {
    const folder = await prisma.entity.create({
      data: {
        name: filename,
        path,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(folderParentId && {
          predecessor: { connect: { id: folderParentId } },
        }),
      },
    });
    console.log(folder);
  };

  const getFolders = async (userId, folderId) => {
    const foldersAndFiles = await prisma.entity.findMany({
      where: {
        predecessorId: folderId,
        userId,
      },
      include: {
        file: true,
      },
    });

    console.log(foldersAndFiles);
    return foldersAndFiles;
  };

  const getHomeFolder = async (userId) => {
    const folder = await prisma.entity.findFirst({
      where: {
        userId,
        path: "/",
      },
    });

    return folder;
  };

  return {
    createUser,
    getUserByUsername,
    getUserById,
    hasUserByUsername,
    createFolder,
    getFolders,
    getHomeFolder,
  };
})();

export default db;
