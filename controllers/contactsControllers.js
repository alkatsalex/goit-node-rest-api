import Contact from "../models/contact.js";

import contactsService from "../services/contactsServices.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  // try {
  //   const data = await contactsService.listContacts();
  //   console.log(typeof data);
  //   res.send(data);
  // } catch (error) {
  //   next(error);
  // }
  try {
    const contacts = await Contact.findById("65df97634586325345192be3");
    console.log(contacts);
    res.send(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const id = req.params.id;

  // try {
  //   const data = await contactsService.getContactById(id);
  //   console.log(data);
  //   if (typeof data === "undefined") {
  //     res.status(404).json({ message: "Not found contact" });
  //   }
  //   res.send(data);
  // } catch (error) {
  //   next(error);
  // }

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
    const data = await contactsService.removeContact(id);
    if (typeof data === "undefined") {
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
    const data = await contactsService.addContact(name, email, phone);
    res.send(data);
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
    const data = await contactsService.updateContact(id, value);
    res.send(data);
  } catch (error) {
    next(error);
  }
};
