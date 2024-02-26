import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contactsPath = path.join(__dirname, "../db/contacts.json");

async function readContacts() {
  const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
  return JSON.parse(data);
}

async function writeContacts(contacts) {
  return fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}

async function listContacts() {
  const contacts = await readContacts();
  return contacts;
}

async function getContactById(contactId) {
  const contacts = await readContacts();

  const contact = contacts.find((contact) => contact.id === contactId);

  return contact;
}

async function removeContact(contactId) {
  const contacts = await readContacts();

  const index = contacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) {
    return undefined;
  }

  const deletedBook = contacts[index];

  contacts.splice(index, 1);

  await writeContacts(contacts);

  return deletedBook;
}

async function addContact(name, email, phone) {
  const contacts = await readContacts();

  const newContact = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
  };

  contacts.push(newContact);

  await writeContacts(contacts);
  return newContact;
}

async function updateContact(id, newParams) {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === id);

  if (index === -1) {
    return undefined;
  }

  const existingContact = contacts[index];
  const updatedContact = { ...existingContact, id };

  // if (newParams.name !== undefined) {
  //   updatedContact.name = newParams.name;
  // }

  // if (newParams.email !== undefined) {
  //   updatedContact.email = newParams.email;
  // }

  // if (newParams.phone !== undefined) {
  //   updatedContact.phone = newParams.phone;
  // }

  for (const key in newParams) {
    if (newParams[key] !== undefined) {
      updatedContact[key] = newParams[key];
    }
  }

  contacts[index] = updatedContact;

  await writeContacts(contacts);

  return updatedContact;
}

listContacts().catch((error) => console.error(error));

const contactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

export default contactsService;
