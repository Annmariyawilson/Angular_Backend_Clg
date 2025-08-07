import { EnquiryForm, FormCount, ContactForm, ContactFormCount } from "../models/schemaModels.js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: "../bin/.env" });

// Utility: Generate 5-digit numeric ID
const generateNumericFormId = () => uuidv4().replace(/\D/g, "").substring(0, 5);
const generateContactId = () => uuidv4().split("-")[0];

// Reusable Response Handler
const handleResponse = (status, message, data = {}, statusCode = 200) => ({ status, message, statusCode, ...data });

// ----------------------------- ENQUIRY SECTION -----------------------------

// Update Enquiry Counts
const updateFormCount = async () => {
    const counts = await EnquiryForm.aggregate([{ $group: { _id: "$formStatus", count: { $sum: 1 } } }]);
    const formCount = counts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
    const total = counts.reduce((sum, { count }) => sum + count, 0);
    await FormCount.findOneAndUpdate({}, { ...formCount, total }, { upsert: true, new: true });
};

// Add Enquiry
export const addEnquiry = async (req, res) => {
    try {
        const formId = generateNumericFormId();
        const newEnquiry = new EnquiryForm({ ...req.body, formId, formStatus: "pending" });
        await newEnquiry.save();
        await updateFormCount();
        return res.status(201).json(handleResponse(true, "Enquiry submitted successfully", { formId }));
    } catch (error) {
        console.error("Error adding enquiry:", error);
        return res.status(500).json(handleResponse(false, "Error adding enquiry"));
    }
};

// Get Enquiry by ID
export const getEnquiryById = async (req, res) => {
    const { formId } = req.params;
    if (!formId) return res.status(400).json(handleResponse(false, "Missing formId"));
    try {
        const enquiry = await EnquiryForm.findOne({ formId });
        if (!enquiry) return res.status(404).json(handleResponse(false, "Enquiry not found"));
        return res.json(handleResponse(true, "Enquiry fetched successfully", { data: enquiry }));
    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json(handleResponse(false, "Error fetching enquiry"));
    }
};

// Get All Enquiries
export const getEnquiryList = async (req, res) => {
    try {
        const enquiries = await EnquiryForm.find();
        const formCount = await FormCount.findOne() || {};
        return res.json(handleResponse(true, "Enquiries fetched successfully", { data: enquiries, formCount }));
    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json(handleResponse(false, "Error fetching enquiries"));
    }
};

// Update Enquiry Status
export const updateEnquiry = async (req, res) => {
    const { formId, status, comment } = req.body;
    const validStatuses = ["pending", "completed", "rejected", "approved"];

    if (!formId || !status || !validStatuses.includes(status)) {
        return res.status(400).json(handleResponse(false, "Invalid or missing data"));
    }

    try {
        const enquiry = await EnquiryForm.findOne({ formId });
        if (!enquiry) return res.status(404).json(handleResponse(false, "Enquiry not found"));

        enquiry.formStatus = status;
        if (status === "rejected") {
            enquiry.comments = comment || "No comment provided";
        }
        await enquiry.save();
        await updateFormCount();
        return res.json(handleResponse(true, "Enquiry status updated successfully"));
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json(handleResponse(false, "Error updating enquiry"));
    }
};

// Delete Enquiry
export const deleteEnquiry = async (req, res) => {
    const { formId } = req.params;
    if (!formId) return res.status(400).json(handleResponse(false, "Missing formId"));
    try {
        const enquiry = await EnquiryForm.findOneAndDelete({ formId });
        if (!enquiry) return res.status(404).json(handleResponse(false, "Enquiry not found"));
        await updateFormCount();
        return res.json(handleResponse(true, "Enquiry deleted successfully"));
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json(handleResponse(false, "Error deleting enquiry"));
    }
};

// ----------------------------- CONTACT SECTION -----------------------------

export const getContactFormCounts = async (req, res) => {
    try {
        const statuses = ["pending", "viewed", "replied", "closed", "rejected"];
        const countData = {};

        for (const status of statuses) {
            countData[status] = await ContactForm.countDocuments({ status });
        }

        countData.total = await ContactForm.countDocuments();

        res.status(200).json({ status: true, data: countData });
    } catch (err) {
        console.error("Error fetching contact form counts:", err);
        res.status(500).json({ status: false, message: "Failed to fetch contact counts" });
    }
};

// Update Contact Counts
export const updateContactCount = async () => {
    const counts = await ContactForm.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const countMap = counts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
    const total = counts.reduce((sum, { count }) => sum + count, 0);
    await ContactFormCount.findOneAndUpdate(
        {},
        { ...countMap, total },
        { upsert: true, new: true }
    );
};

// Submit Contact Form
export const submitContactForm = async (req, res) => {
    try {
        const contactId = generateContactId();
        const newContact = new ContactForm({
            ...req.body,
            contactId,
            status: "pending",
        });
        await newContact.save();
        await updateContactCount();
        return res.status(201).json(handleResponse(true, "Message submitted successfully", { contactId }));
    } catch (error) {
        console.error("Submit Contact Error:", error);
        return res.status(500).json(handleResponse(false, "Error submitting contact form"));
    }
};

// Get All Contacts
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await ContactForm.find().sort({ createdAt: -1 });
        const contactCount = await ContactFormCount.findOne() || {};
        return res.json(handleResponse(true, "Contacts fetched", { data: contacts, contactCount }));
    } catch (error) {
        console.error("Fetch Contacts Error:", error);
        return res.status(500).json(handleResponse(false, "Error fetching contacts"));
    }
};

// Get Contact by ID
export const getContactById = async (req, res) => {
    const { contactId } = req.params;
    try {
        const contact = await ContactForm.findOne({ contactId });
        if (!contact) return res.status(404).json(handleResponse(false, "Contact not found"));
        return res.json(handleResponse(true, "Contact fetched", { data: contact }));
    } catch (error) {
        console.error("Get Contact Error:", error);
        return res.status(500).json(handleResponse(false, "Error fetching contact"));
    }
};

// Update Contact Status
export const updateContactStatus = async (req, res) => {
    const { contactId, status } = req.body;
    const validStatuses = ["pending", "viewed", "replied", "closed", "rejected"];

    if (!contactId || !validStatuses.includes(status)) {
        return res.status(400).json(handleResponse(false, "Invalid request parameters"));
    }

    try {
        const contact = await ContactForm.findOne({ contactId });
        if (!contact) return res.status(404).json(handleResponse(false, "Contact not found"));

        contact.status = status;
        await contact.save();
        await updateContactCount();

        return res.json(handleResponse(true, "Status updated"));
    } catch (error) {
        console.error("Update Contact Error:", error);
        return res.status(500).json(handleResponse(false, "Error updating contact status"));
    }
};

// Delete Contact
export const deleteContact = async (req, res) => {
    const { contactId } = req.params;
    try {
        const contact = await ContactForm.findOneAndDelete({ contactId });
        if (!contact) return res.status(404).json(handleResponse(false, "Contact not found"));

        await updateContactCount();
        return res.json(handleResponse(true, "Contact deleted"));
    } catch (error) {
        console.error("Delete Contact Error:", error);
        return res.status(500).json(handleResponse(false, "Error deleting contact"));
    }
};

