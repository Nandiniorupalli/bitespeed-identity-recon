"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("../data-source");
const Contact_1 = require("../entity/Contact");
const typeorm_1 = require("typeorm");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or phone number required" });
    }
    const contactRepo = data_source_1.AppDataSource.getRepository(Contact_1.Contact);
    const existingContacts = yield contactRepo.find({
        where: [{ email }, { phoneNumber }],
    });
    if (existingContacts.length === 0) {
        const newContact = contactRepo.create({
            email,
            phoneNumber,
            linkPrecedence: "primary",
        });
        yield contactRepo.save(newContact);
        return res.json({
            contact: {
                primaryContactId: newContact.id,
                emails: [newContact.email],
                phoneNumbers: [newContact.phoneNumber],
                secondaryContactIds: [],
            },
        });
    }
    const primaryContacts = existingContacts.filter((c) => c.linkPrecedence === "primary");
    const oldestPrimary = primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    const allLinkedContacts = yield contactRepo.find({
        where: [
            { id: (0, typeorm_1.In)(existingContacts.map((c) => c.id)) },
            { linkedId: (0, typeorm_1.In)(existingContacts.map((c) => c.id)) },
        ],
    });
    const alreadyExists = allLinkedContacts.some((c) => c.email === email && c.phoneNumber === phoneNumber);
    if (!alreadyExists) {
        const newSecondary = contactRepo.create({
            email,
            phoneNumber,
            linkPrecedence: "secondary",
            linkedId: oldestPrimary.id,
        });
        yield contactRepo.save(newSecondary);
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
}));
exports.default = router;
