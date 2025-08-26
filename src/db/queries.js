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
    const { id: folderParentId } = await db.createFolder(userId, username);

    await db.createFolder(userId, "documents", folderParentId);
    await db.createFolder(userId, "images", folderParentId);
    await db.createFolder(userId, "videos", folderParentId);
    await db.createFolder(userId, "audios", folderParentId);
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

  const createFolder = async (userId, foldername, parentFolderId) => {
    const folder = await prisma.entity.create({
      data: {
        name: foldername,
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

  const editFolder = async (folderId, foldername) => {
    const folder = await prisma.entity.update({
      where: {
        id: folderId,
      },
      data: {
        name: foldername,
      },
    });

    return folder;
  };

  const createFile = async (userId, filename, fileInfos, folderParentId) => {
    const { id: entityId } = await prisma.entity.create({
      data: {
        name: filename,
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

  const editFile = async (fileId, filename) => {
    const file = await prisma.entity.update({
      where: {
        id: fileId,
      },
      data: {
        name: filename,
      },
    });

    return file;
  };

  const deleteEntity = async (entityId, deletedEntities = []) => {
    const childEntities = await prisma.entity.findMany({
      where: {
        predecessorId: entityId,
      },
    });

    for (const entity of childEntities) {
      const childDeleted = await deleteEntity(entity.id);
      deletedEntities = deletedEntities.concat(childDeleted);
    }

    const deletedEntity = await prisma.entity.delete({
      where: {
        id: entityId,
      },
    });

    return deletedEntities.concat(deletedEntity);
  };

  const getEntityById = async (entityId) => {
    const entity = await prisma.entity.findFirst({
      where: {
        id: entityId,
      },
      include: {
        successor: true,
        file: true,
      },
    });

    return entity;
  };

  const getEntities = async (userId, folderId) => {
    const folders = await prisma.entity.findMany({
      where: {
        userId,
        predecessorId: folderId,
        file: null,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        file: true,
      },
    });

    const files = await prisma.entity.findMany({
      where: {
        userId,
        predecessorId: folderId,
        NOT: [{ file: null }],
      },
      orderBy: {
        name: "asc",
      },
      include: {
        file: true,
      },
    });

    const foldersAndFiles = folders.concat(files);
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
          { name: "audios" },
        ],
      },
    });

    const order = [username, "documents", "images", "videos", "audios"];
    const orderedFolders = [];
    order.forEach((foldername) => {
      const foundFolder = folders.find(({ name }) => name === foldername);
      if (foundFolder) orderedFolders.push(foundFolder);
    });

    return orderedFolders;
  };

  const getRootFolder = async (userId) => {
    const folder = await prisma.entity.findFirst({
      where: {
        userId,
        predecessorId: null,
      },
    });

    return folder;
  };

  const doesEntityExistsInFolder = async (filename, folderId) => {
    const entity = await db.getEntityById(folderId);

    const successorNames = entity.successor.map(({ name }) => name);
    if (successorNames.includes(filename)) return true;
    return false;
  };

  const doesFolderIdExists = async (folderId) => {
    const folder = await prisma.entity.findFirst({
      where: {
        id: folderId,
      },
    });

    return folder !== null;
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
    editFile,
    deleteEntity,
    getEntityById,
    getEntities,
    getSidebarFolders,
    getRootFolder,
    doesEntityExistsInFolder,
    doesFolderIdExists,
  };
})();

export default db;
