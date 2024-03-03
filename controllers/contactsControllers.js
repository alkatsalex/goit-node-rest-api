import Contact from "../models/contact.js";

import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  console.log(req);
  try {
    const contacts = await Contact.find({});
    console.log(Contact);
    res.send(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const id = req.params.id;

  try {
    const data = await Contact.findById(id);
    console.log(data);
    if (data === null) {
      return res.status(404).json({ message: "Not found contact" });
    }
    res.send(data);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const id = req.params.id;
  try {
    const data = await Contact.findByIdAndDelete(id);

    if (data === null) {
      res.status(404).json({ message: "Not found contact" });
    }
    res.send(data);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, email, phone } = req.body;

  const { _, error } = createContactSchema.validate({ name, email, phone });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const result = await Contact.create({ name, email, phone });

    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;
  const { value, error } = updateContactSchema.validate({ name, email, phone });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const data = await Contact.findByIdAndUpdate(id, value);
    res.send(data);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  const id = req.params.id;
  const { favorite } = req.body;

  try {
    const data = await Contact.findByIdAndUpdate(id, { favorite, _id: id });

    if (data === null) {
      return res.status(404).json({ message: "Not found contact" });
    }
    res.send(data);
  } catch (error) {
    next(error);
  }
};
