import * as fs from "node:fs/promises";
import * as path from "node:path";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jimp from "jimp";

import { usersRegisterSchema } from "../schemas/usersSchema.js";
import { subscriptionSchema } from "../schemas/subscriptionUpdateSchema.js";

export const registerUsers = async (req, res, next) => {
  const { email, password } = req.body;

  const normalizedEmail = email.toLowerCase();
  const { _, error } = usersRegisterSchema.validate({
    email: normalizedEmail,
    password,
  });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user !== null) {
      return res.status(409).send({ message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email: normalizedEmail,
      password: passwordHash,
    });

    res.status(201).send({ message: "Registration successfully" });
  } catch (error) {
    next(error);
  }
};

export const loginUsers = async (req, res, next) => {
  const { email, password } = req.body;

  const normalizedEmail = email.toLowerCase();

  const { _, error } = usersRegisterSchema.validate({
    email: normalizedEmail,
    password,
  });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (user === null) {
      res.status(401).send({ message: "Email or password is wrong" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect === false) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await User.findByIdAndUpdate(user._id, { token });

    res.send({ token });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(res.user.id, { token: null });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  const { subscription } = req.body;
  console.log(res.user.id);
  const { value, error } = subscriptionSchema.validate({
    subscription,
  });
  console.log(value.subscription);
  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    await User.findByIdAndUpdate(res.user.id, {
      subscription: value.subscription,
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
export const updateAvatar = async (req, res, next) => {
  console.log(req.file);
  const oldPath = req.file.path;
  const newPath = path.join(process.cwd(), "public/avatars", req.file.filename);

  try {
    await fs.rename(oldPath, newPath);

    await Jimp.read(newPath)
      .then((file) => {
        return file.resize(250, 250).write(newPath);
      })
      .catch((err) => {
        console.error(err);
      });

    const user = await User.findByIdAndUpdate(
      res.user.id,
      {
        avatarURL: req.file.filename,
      },
      { new: true }
    );
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

export const getAvatar = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(res.user.id);
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.avatarURL === null) {
      return res.status(404).send({ message: "Avatar not found" });
    }

    res.sendFile(path.join(process.cwd(), "public/avatars", user.avatarURL));
  } catch (error) {
    next(error);
  }
};
