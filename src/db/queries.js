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

  const hasUserByUsername = async (username) => {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    return !!user;
  };

  return { createUser, hasUserByUsername };
})();

export default db;
