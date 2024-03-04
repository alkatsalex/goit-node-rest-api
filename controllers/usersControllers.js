import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { usersRegisterSchema } from "../schemas/usersSchema.js";

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
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
