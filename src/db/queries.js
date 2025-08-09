import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = (() => {
  const prisma = new PrismaClient();

  const createUser = async (userData) => {
    const { username, password: unhashedPassword } = userData;
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
  };

  const getFolderById = async (userId, folderId) => {
    const folder = await prisma.entity.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });

    return folder;
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

    return foldersAndFiles;
  };

  const getFolderByNameAndPath = async (userId, name, path) => {
    const folder = await prisma.entity.findFirst({
      where: {
        name,
        path,
        userId,
      },
    });

    return folder;
  };

  const getPredecessorByPath = async (userId, path) => {
    const childFolder = await prisma.entity.findFirst({
      where: {
        path,
        userId,
      },
    });

    if (!childFolder) return null;
    const { predecessorId } = childFolder;

    const parentFolder = await prisma.entity.findFirst({
      where: {
        id: predecessorId,
      },
    });

    return parentFolder;
  };

  return {
    createUser,
    getUserByUsername,
    getUserById,
    hasUserByUsername,
    createFolder,
    getFolderById,
    getFolders,
    getFolderByNameAndPath,
    getPredecessorByPath,
  };
})();

export default db;
