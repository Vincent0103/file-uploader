import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = (() => {
  const prisma = new PrismaClient();

  const createUser = async (userData) => {
    const { username, password: unhashedPassword } = userData;
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(unhashedPassword, salt);

    const user = await prisma.user.create({
      data: {
        username,
        password,
      },
    });

    return user;
  };

  const initFolders = async (userId, username) => {
    const { id: folderParentId } = await db.createFolder(userId, username, "/");

    await db.createFolder(userId, "documents", `/${username}/`, folderParentId);
    await db.createFolder(userId, "images", `/${username}/`, folderParentId);
    await db.createFolder(userId, "videos", `/${username}/`, folderParentId);
    await db.createFolder(userId, "music", `/${username}/`, folderParentId);
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

  const createFolder = async (userId, foldername, path, parentFolderId) => {
    const folder = await prisma.entity.create({
      data: {
        name: foldername,
        path,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(parentFolderId && {
          predecessor: { connect: { id: parentFolderId } },
        }),
      },
    });

    return folder;
  };

  const editFolder = async (userId, folderId, foldername) => {
    const folder = await prisma.entity.update({
      where: {
        userId,
        id: folderId,
      },
      data: {
        name: foldername,
      },
    });

    return folder;
  };

  const createFile = async (
    userId,
    filename,
    fileInfos,
    path,
    folderParentId,
  ) => {
    const { id: entityId } = await prisma.entity.create({
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

    const file = await prisma.file.create({
      data: {
        ...fileInfos,
        entity: {
          connect: {
            id: entityId,
          },
        },
      },
    });

    return file;
  };

  const getFolderById = async (userId, folderId) => {
    const folder = await prisma.entity.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        successor: true,
      },
    });

    return folder;
  };

  const getEntities = async (userId, folderId) => {
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

  const getSidebarFolders = async (userId, username) => {
    const folders = await prisma.entity.findMany({
      where: {
        userId,
        OR: [
          { name: username },
          { name: "documents" },
          { name: "images" },
          { name: "videos" },
          { name: "music" },
        ],
      },
    });

    return folders;
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

  const doesEntityExistsInPath = async (userId, filename, entityId) => {
    const entity = await db.getFolderById(userId, entityId);

    const successorNames = entity.successor.map(({ name }) => name);
    if (successorNames.includes(filename)) return true;
    return false;
  };

  return {
    createUser,
    initFolders,
    getUserByUsername,
    getUserById,
    hasUserByUsername,
    createFolder,
    editFolder,
    createFile,
    getFolderById,
    getEntities,
    getSidebarFolders,
    getFolderByNameAndPath,
    getPredecessorByPath,
    doesEntityExistsInPath,
  };
})();

export default db;
