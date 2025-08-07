import { CampusAchievement } from "../models/schemaModels.js";
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

const formatAchievement = (req, achievement) => ({
  ...achievement._doc,
  imageUrl: getImageUrl(req, achievement.image),
});

// ────────── Add Achievement ────────── //
export const addCampusAchievement = async (req, res) => {
  let imagePath = null;
  try {
    const { title, description, date, achievementType } = req.body;

    imagePath = req.file
      ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/")
      : null;

    const newAchievement = new CampusAchievement({
      achievementId: generateId(),
      title,
      description,
      achievementType,
      date,
      image: imagePath,
    });

    await newAchievement.save();

    res.status(201).json({
      status: true,
      message: "Achievement added successfully!",
      data: formatAchievement(req, newAchievement),
    });
  } catch (error) {
    if (req.file) deleteImage(req.file.path);

    res.status(500).json({
      status: false,
      message: "Failed to add achievement",
      error: error.message,
    });
  }
};

// ────────── Get All Achievements ────────── //
export const getCampusAchievements = async (req, res) => {
  try {
    const achievements = await CampusAchievement.find().sort({ date: -1 });
    const formatted = achievements.map((item) => formatAchievement(req, item));

    res.json({ status: true, data: formatted });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve achievements",
      error: error.message,
    });
  }
};

// ────────── Get Achievement By ID ────────── //
export const getAchievementById = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const achievement = await CampusAchievement.findOne({ achievementId });

    if (!achievement) {
      return res.status(404).json({ status: false, message: "Achievement not found" });
    }

    res.json({ status: true, data: formatAchievement(req, achievement) });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve achievement",
      error: error.message,
    });
  }
};

// ────────── Update Achievement ────────── //
export const updateAchievement = async (req, res) => {
  let newImagePath = null;
  try {
    const { achievementId } = req.params;
    const { title, description, date, achievementType } = req.body;

    const achievement = await CampusAchievement.findOne({ achievementId });
    if (!achievement) {
      return res.status(404).json({ status: false, message: "Achievement not found" });
    }

    // Handle image update
    if (req.file) {
      if (achievement.image) {
        deleteImage(path.join(process.cwd(), achievement.image));
      }
      newImagePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
    } else {
      newImagePath = achievement.image;
    }

    const updatedAchievement = await CampusAchievement.findOneAndUpdate(
      { achievementId },
      { title, description, date, achievementType, image: newImagePath },
      { new: true }
    );

    res.json({
      status: true,
      message: "Achievement updated successfully",
      data: formatAchievement(req, updatedAchievement),
    });
  } catch (error) {
    if (req.file) deleteImage(req.file.path);

    res.status(500).json({
      status: false,
      message: "Failed to update achievement",
      error: error.message,
    });
  }
};

// ────────── Delete Achievement ────────── //
export const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const achievement = await CampusAchievement.findOne({ achievementId });
    if (!achievement) {
      return res.status(404).json({ status: false, message: "Achievement not found" });
    }

    if (achievement.image) {
      deleteImage(path.join(process.cwd(), achievement.image));
    }

    await CampusAchievement.findOneAndDelete({ achievementId });

    res.json({ status: true, message: "Achievement deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete achievement",
      error: error.message,
    });
  }
};
