import { CampusNews, UniversityNews } from "../models/schemaModels.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// =====================================
// 🔧 Helper Functions
// =====================================

// Generate full image URL
const getImageUrl = (req, imagePath) => {
    if (!imagePath) return null;
    // Normalize path and ensure consistent URL format
    const normalizedPath = imagePath.replace(/\\/g, "/").replace("public/", "");
    return `${req.protocol}://${req.get("host")}/${normalizedPath}`;

};
// Generate a numeric ID
const generateNumericId = () => uuidv4().replace(/\D/g, "").substring(0, 6);

// Delete uploaded image if error occurs
const deleteUploadedFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error("Error deleting old image:", error.message);
        }
    }
};

// =====================================
// 📌 CAMPUS NEWS CONTROLLERS
// =====================================

// ➕ Add Campus News
export const addCampusNews = async (req, res) => {
    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

    try {
        const { title, description, date } = req.body;

        const newNews = new CampusNews({
            newsId: generateNumericId(),
            title,
            description,
            date,
            image: imagePath,
        });

        await newNews.save();

        res.status(201).json({
            status: true,
            message: "Campus news added successfully!",
            data: newNews,
        });
    } catch (error) {
        if (imagePath) deleteUploadedFile(path.join(process.cwd(), imagePath));

        res.status(500).json({
            status: false,
            message: "Failed to add campus news",
            error: error.message,
        });
    }
};

// 📥 Get All Campus News
export const getCampusNews = async (req, res) => {
    try {
        const news = await CampusNews.find().sort({ date: -1 });

        const formatted = news.map(n => ({
            ...n._doc,
            imageUrl: getImageUrl(req, n.image),
        }));

        res.json({ status: true, data: formatted });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve campus news",
            error: error.message,
        });
    }
};

// 🔍 Get Campus News by ID
export const getCampusNewsById = async (req, res) => {
    try {
        const { newsId } = req.params;
        const news = await CampusNews.findOne({ newsId });

        if (!news) {
            return res.status(404).json({
                status: false,
                message: "Campus news not found",
            });
        }

        res.json({
            status: true,
            data: {
                ...news._doc,
                imageUrl: getImageUrl(req, news.image),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to fetch campus news",
            error: error.message,
        });
    }
};

// ✏️ Update Campus News
export const updateCampusNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date } = req.body;

        const news = await CampusNews.findById(id);
        if (!news) {
            return res.status(404).json({
                status: false,
                message: "Campus news not found",
            });
        }

        // Delete old image if new one is uploaded
        if (req.file && news.image) {
            deleteUploadedFile(news.image);
        }

        const updatedData = {
            title,
            description,
            date,
            image: req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : news.image,
        };

        const updatedNews = await CampusNews.findByIdAndUpdate(id, updatedData, { new: true });

        res.json({
            status: true,
            message: "Campus news updated successfully",
            data: updatedNews,
        });
    } catch (error) {
        if (req.file) deleteUploadedFile(path.join(process.cwd(), image));
        res.status(500).json({
            status: false,
            message: "Failed to update campus news",
            error: error.message,
        });
    }
};

// ❌ Delete Campus News
export const deleteCampusNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await CampusNews.findByIdAndDelete(id);

        if (!news) {
            return res.status(404).json({
                status: false,
                message: "Campus news not found",
            });
        }

        if (news.image) deleteUploadedFile(path.join(process.cwd(), news.image));

        res.json({
            status: true,
            message: "Campus news deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to delete campus news",
            error: error.message,
        });
    }
};

// =====================================
// 📌 UNIVERSITY NEWS CONTROLLERS
// =====================================

// ➕ Add University News
export const addUniversityNews = async (req, res) => {
    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

    try {
        const { title, description, date } = req.body;

        const newNews = new UniversityNews({
            newsId: generateNumericId(),
            title,
            description,
            date,
            image: imagePath,
        });

        await newNews.save();

        res.status(201).json({
            status: true,
            message: "University news added successfully!",
            data: newNews,
        });
    } catch (error) {
        if (imagePath) deleteUploadedFile(path.join(process.cwd(), imagePath));
        res.status(500).json({
            status: false,
            message: "Failed to add university news",
            error: error.message,
        });
    }
};

// 📥 Get All University News
export const getUniversityNews = async (req, res) => {
    try {
        const news = await UniversityNews.find().sort({ date: -1 });

        const formatted = news.map(n => ({
            ...n._doc,
            imageUrl: getImageUrl(req, n.image),
        }));

        res.json({ status: true, data: formatted });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve university news",
            error: error.message,
        });
    }
};

// 🔍 Get University News by ID
export const getUniversityNewsById = async (req, res) => {
    try {
        const { newsId } = req.params;
        const news = await UniversityNews.findOne({ newsId });

        if (!news) {
            return res.status(404).json({
                status: false,
                message: "University news not found",
            });
        }

        res.json({
            status: true,
            data: {
                ...news._doc,
                imageUrl: getImageUrl(req, news.image),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to fetch university news",
            error: error.message,
        });
    }
};

// ✏️ Update University News
export const updateUniversityNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date } = req.body;

        const news = await UniversityNews.findById(id);
        if (!news) {
            return res.status(404).json({
                status: false,
                message: "University news not found",
            });
        }

        if (req.file && news.image) {
            deleteUploadedFile(path.join(process.cwd(), news.image));
        }

        const updatedData = {
            title,
            description,
            date,
            image: req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : news.image,
        };

        const updatedNews = await UniversityNews.findByIdAndUpdate(id, updatedData, { new: true });

        res.json({
            status: true,
            message: "University news updated successfully",
            data: updatedNews,
        });
    } catch (error) {
        deleteUploadedFile(path.join(process.cwd(), updatedData.image));
        res.status(500).json({
            status: false,
            message: "Failed to update university news",
            error: error.message,
        });
    }
};

// ❌ Delete University News
export const deleteUniversityNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await UniversityNews.findOneAndDelete({ newsId: id });

        if (!news) {
            return res.status(404).json({
                status: false,
                message: "University news not found",
            });
        }

        if (news.image) {
            deleteUploadedFile(path.join(process.cwd(), news.image));
        }

        res.json({
            status: true,
            message: "University news deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to delete university news",
            error: error.message,
        });
    }
};
