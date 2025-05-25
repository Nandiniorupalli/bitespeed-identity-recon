import express from "express";
import { AppDataSource } from "../data-source";
import { Contact } from "../entity/Contact";
import { In } from "typeorm";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number required" });
  }

  const contactRepo = AppDataSource.getRepository(Contact);

  const existingContacts = await contactRepo.find({
    where: [{ email }, { phoneNumber }],
  });

  if (existingContacts.length === 0) {
    const newContact = contactRepo.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
    });
    await contactRepo.save(newContact);

    return res.json({
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      },
    });
  }

  const primaryContacts = existingContacts.filter(
    (c) => c.linkPrecedence === "primary"
  );
  const oldestPrimary = primaryContacts.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )[0];

  const allLinkedContacts = await contactRepo.find({
    where: [
      { id: In(existingContacts.map((c) => c.id)) },
      { linkedId: In(existingContacts.map((c) => c.id)) },
    ],
  });

  const alreadyExists = allLinkedContacts.some(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!alreadyExists) {
    const newSecondary = contactRepo.create({
      email,
      phoneNumber,
      linkPrecedence: "secondary",
      linkedId: oldestPrimary.id,
    });
    await contactRepo.save(newSecondary);
    allLinkedContacts.push(newSecondary);
  }

  const uniqueEmails = [
    ...new Set(allLinkedContacts.map((c) => c.email).filter(Boolean)),
  ];
  const uniquePhones = [
    ...new Set(allLinkedContacts.map((c) => c.phoneNumber).filter(Boolean)),
  ];
  const secondaryIds = allLinkedContacts
    .filter((c) => c.linkPrecedence === "secondary")
    .map((c) => c.id);

  return res.json({
    contact: {
      primaryContactId: oldestPrimary.id,
      emails: uniqueEmails,
      phoneNumbers: uniquePhones,
      secondaryContactIds: secondaryIds,
    },
  });
});

export default router;
