import express from "express";
import {
  registerUsers,
  loginUsers,
  logoutUser,
} from "../controllers/usersControllers.js";
import { auth } from "../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.post("/register", registerUsers);
usersRouter.post("/login", loginUsers);
usersRouter.get("/logout", auth, logoutUser);

export default usersRouter;
