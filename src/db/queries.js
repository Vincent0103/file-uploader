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

  return { createUser, getUserByUsername, getUserById, hasUserByUsername };
})();

export default db;
