import Contact from "../models/contact.js";

import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  const owner = res.user.id;

  const { favorite } = req.query;

  try {
    if (favorite === "true") {
      const favoriteContacts = await Contact.find({ owner, favorite });

      return res.send(favoriteContacts);
    }

    const contacts = await Contact.find({ owner });

    res.send(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const id = req.params.id;
  const owner = res.user.id;
  try {
    const data = await Contact.findById(id);
    if (data === null) {
      return res.status(404).json({ message: "Not found contact" });
    }

    if (data.owner.toString() !== owner) {
      return res.status(404).json({ message: "Not found contact" });
    }
    res.send(data);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const id = req.params.id;
  const owner = res.user.id;
  try {
    const contact = await Contact.findOneAndDelete({ _id: id, owner: owner });

    if (!contact) {
      return res.status(404).json({ message: "Not found contact" });
    }

    res.send(contact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const owner = res.user.id;

  const { _, error } = createContactSchema.validate({ name, email, phone });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const result = await Contact.create({ name, email, phone, owner });

    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const id = req.params.id;
  const owner = res.user.id;
  const { name, email, phone } = req.body;
  const { value, error } = updateContactSchema.validate({ name, email, phone });

  if (typeof error !== "undefined") {
    return res.status(400).json({ message: error.message });
  }

  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: id, owner: owner },
      value,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Not found contact" });
    }
    res.send(contact);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  const id = req.params.id;
  const favorite = req.body;
  const owner = res.user.id;

  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: id, owner: owner },
      favorite,
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Not found contact" });
    }

    res.send(contact);
  } catch (error) {
    next(error);
  }
};
