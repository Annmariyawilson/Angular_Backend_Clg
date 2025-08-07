import { Event, EventCount } from "../models/schemaModels.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Generate unique numeric event ID
const generateNumericFormId = () => uuidv4().replace(/\D/g, "").substring(0, 6);

// Utility: Get full image URL
const getImageUrl = (req, imagePath) =>
  imagePath ? `${req.protocol}://${req.get("host")}/${imagePath.replace("public/", "")}` : null;

// Utility: Delete image
const deleteImage = (imgPath) => {
  const fullPath = path.join(process.cwd(), "public", imgPath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// Utility: Update event count collection
const updateEventCount = async () => {
  const counts = await Event.aggregate([
    { $group: { _id: "$eventStatus", count: { $sum: 1 } } },
  ]);

  const stats = { completed: 0, upcoming: 0, canceled: 0, total: 0 };
  counts.forEach(({ _id, count }) => {
    if (stats.hasOwnProperty(_id)) stats[_id] = count;
    stats.total += count;
  });

  await EventCount.findOneAndUpdate({}, stats, { upsert: true, new: true });
};

// ─────────────────────────────────────────────
// CREATE EVENT
export const createEvent = async (req, res) => {
  const {
    title, description, eventDate, endDate,
    category, location, totalSlots, eventStatus,
    website, targetAudience,
  } = req.body;

  let imagePath = null;
  try {
    if (req.file) {
      imagePath = path.relative(path.join(process.cwd(), "public"), req.file.path).replace(/\\/g, "/");
    }

    const newEvent = new Event({
      eventId: generateNumericFormId(),
      title, description, eventDate, endDate,
      category, location, totalSlots,
      bookedSlots: 0,
      eventStatus: eventStatus || "upcoming",
      website, targetAudience,
      image: imagePath,
    });

    await newEvent.save();
    await updateEventCount();

    res.status(201).json({
      status: true,
      message: "Event created successfully",
      data: newEvent,
    });

  } catch (error) {
    if (imagePath) deleteImage(imagePath);
    res.status(500).json({ status: false, message: "Event creation failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    await updateEventCount();
    const events = await Event.find().sort({ eventDate: -1 });
    const eventCount = await EventCount.findOne();

    const response = events.map((ev) => ({
      ...ev._doc,
      imageUrl: getImageUrl(req, ev.image),
    }));

    res.json({ status: true, data: response, eventCount });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to fetch events", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET EVENT BY ID
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ eventId });
    if (!event) return res.status(404).json({ status: false, message: "Event not found" });

    res.json({ status: true, data: { ...event._doc, imageUrl: getImageUrl(req, event.image) } });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to fetch event", error: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE EVENT
export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    title, description, eventDate, endDate,
    category, location, totalSlots, eventStatus,
    website, targetAudience,
  } = req.body;

  try {
    const event = await Event.findOne({ eventId });
    if (!event) return res.status(404).json({ status: false, message: "Event not found" });

    if (req.file && event.image) deleteImage(event.image);

    const newImagePath = req.file
      ? path.relative(path.join(process.cwd(), "public"), req.file.path).replace(/\\/g, "/")
      : event.image;

    const updated = await Event.findOneAndUpdate(
      { eventId },
      {
        title, description, eventDate, endDate,
        category, location, totalSlots,
        eventStatus, website, targetAudience,
        image: newImagePath,
      },
      { new: true }
    );

    await updateEventCount();

    res.status(200).json({
      status: true,
      message: "Event updated successfully",
      data: { ...updated._doc, imageUrl: getImageUrl(req, updated.image) },
    });

  } catch (error) {
    if (req.file?.path) {
      const rollbackPath = path.relative(path.join(process.cwd(), "public"), req.file.path).replace(/\\/g, "/");
      deleteImage(rollbackPath);
    }
    res.status(500).json({ status: false, message: "Update failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const deleted = await Event.findOneAndDelete({ eventId });
    if (!deleted) return res.status(404).json({ status: false, message: "Event not found" });

    if (deleted.image) deleteImage(deleted.image);

    await updateEventCount();
    res.json({ status: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Deletion failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET EVENT COUNT ONLY
export const getEventCount = async (req, res) => {
  try {
    const eventCount = await EventCount.findOne();
    if (!eventCount) {
      return res.status(404).json({ status: false, message: "Event count not found" });
    }
    res.json({ status: true, data: eventCount });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to get event count", error: error.message });
  }
};
