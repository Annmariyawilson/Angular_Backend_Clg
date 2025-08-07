import { Testimonial } from "../models/schemaModels.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// ────────── Utility Functions ────────── //
const generateId = () => uuidv4().replace(/\D/g, "").substring(0, 6);

const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  const normalizedPath = imagePath.replace(/\\/g, "/").replace("public/", "");
  return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
};

const deleteImage = (imagePath) => {
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error("Error deleting image:", error.message);
    }
  }
};

const formatTestimonial = (req, testimonial) => ({
  testimonialId: testimonial.testimonialId,
  ...testimonial._doc,
  imageUrl: getImageUrl(req, testimonial.image),
});

// ────────── Add Testimonial ────────── //
export const addTestimonial = async (req, res) => {
  let imagePath = null;
  try {
    const { name, profession, text } = req.body;

    imagePath = req.file
      ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/")
      : null;

    const newTestimonial = new Testimonial({
      testimonialId: generateId(),
      name,
      profession,
      text,
      image: imagePath,
    });

    await newTestimonial.save();

    res.status(201).json({
      status: true,
      message: "Testimonial added successfully!",
      data: formatTestimonial(req, newTestimonial),
    });
  } catch (error) {
    if (req.file) deleteImage(req.file.path);

    res.status(500).json({
      status: false,
      message: "Failed to add testimonial",
      error: error.message,
    });
  }
};

// ────────── Get All Testimonials ────────── //
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ testimonialId: -1 });
    const formatted = testimonials.map((item) => formatTestimonial(req, item));

    res.json({ status: true, data: formatted });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve testimonials",
      error: error.message,
    });
  }
};

// ────────── Delete Testimonial ────────── //
export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;

    const testimonial = await Testimonial.findOne({ testimonialId });
    if (!testimonial) {
      return res
        .status(404)
        .json({ status: false, message: "Testimonial not found" });
    }

    if (testimonial.image) {
      deleteImage(path.join(process.cwd(), testimonial.image));
    }

    await Testimonial.findOneAndDelete({ testimonialId });

    res.json({ status: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete testimonial",
      error: error.message,
    });
  }
};
