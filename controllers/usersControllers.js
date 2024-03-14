import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import crypto from "node:crypto";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jimp from "jimp";
import nodemailer from "nodemailer";

import { usersRegisterSchema } from "../schemas/usersSchema.js";
import { subscriptionSchema } from "../schemas/subscriptionUpdateSchema.js";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

//# transport з налаштуваннями smtp gmail для відправки повідомлень на пошту

// const transport = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   auth: {
//     user: "alkatsalex322@gmail.com",
//     pass: "cyrl dpdd oezy iuvb",
//   },
// });

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
    const verificationToken = crypto.randomUUID();

    transport.sendMail({
      from: "alkatsalex322@gmail.com",
      to: normalizedEmail,
      subject: "Hello ✔",
      text: `to confirm you registration please open the link http://localhost:3000/api/users/verify/${verificationToken}`,
      html: `<p>to confirm you registration please click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a></p>`,
    });

    await User.create({
      email: normalizedEmail,
      password: passwordHash,
      verificationToken,
    });

    res.status(201).send({
      message: "Registration successfully, check your email to verify",
    });
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

    if (user.verify === false) {
      res.status(401).send({ message: "Your account is not verify" });
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
    const subscription = user.subscription;
    await User.findByIdAndUpdate(user._id, { token });
    const resUser = {
      token,
      user: {
        email,
        subscription,
      },
    };
    res.send(resUser);
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

export const verificationController = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOneAndUpdate(
      { verificationToken },
      {
        verify: true,
        verificationToken: null,
      }
    );

    if (user === null) {
      return res.status(404).json({ message: "Not found" });
    }
    console.log(user);
    res.send({ m: "ok" });
  } catch (error) {
    next(error);
  }
};

export const repeatedVerificationController = async (req, res, next) => {
  const { email } = req.body;

  if (email === null) {
    return res.status(400).send({ message: "missing required field email" });
  }
  try {
    const user = await User.findOne({ email });

    if (user === null) {
      return res.status(404).json({ message: "Not found" });
    }
    if (user.verify === true) {
      return res.status(404).json({ message: "Not found" });
    }

    transport.sendMail({
      from: "alkatsalex@ukr.net",
      to: email,
      subject: "Hello 2",
      text: `to confirm you registration please open the link http://localhost:3000/api/users/verify/${user.verificationToken}`,
      html: `<p>to confirm you registration please click on the <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">link</a></p>`,
    });

    res.send({ message: "Repeated verification send on email" });
  } catch (error) {
    next(error);
  }
};
