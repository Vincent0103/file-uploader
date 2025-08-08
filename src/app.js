import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import express from "express";
import expressSession from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import path from "path";
import signupRouter from "./routes/signupRouter";
import loginRouter from "./routes/loginRouter";
import logoutRouter from "./routes/logoutRouter";
import db from "./db/queries";
import createRouter from "./routes/createRouter";
import folderRouter from "./routes/folderRouter";

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "pochita",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);
app.use(passport.session());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.getUserByUsername(username);
      const errorMsg = "Incorrect username or password.";

      if (!user) {
        return done(null, false, { message: errorMsg });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: errorMsg });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/signup");
  }

  const { id: userId } = req.user;
  const folder = await db.getHomeFolder(userId);
  console.log(folder);

  return res.redirect(`/folder/${folder.id}`);
});

app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/create", createRouter);
app.use("/logout", logoutRouter);
app.use("/folder", folderRouter);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Express app listening at port ${PORT}`);
});
