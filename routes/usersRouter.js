import express from "express";
import {
  registerUsers,
  loginUsers,
  logoutUser,
  updateSubscription,
  updateAvatar,
  getAvatar,
} from "../controllers/usersControllers.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const usersRouter = express.Router();

usersRouter.post("/register", registerUsers);
usersRouter.post("/login", loginUsers);
usersRouter.get("/logout", auth, logoutUser);
usersRouter.patch("/", auth, updateSubscription);
usersRouter.patch("/avatar", auth, upload.single("avatarURL"), updateAvatar);
usersRouter.get("/avatar", auth, getAvatar);

export default usersRouter;
