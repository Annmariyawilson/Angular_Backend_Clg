import { Faculty, BoardMember, Course, Placement, RankHolder } from "../models/schemaModels.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// ⏺ Utility Functions
const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  const normalizedPath = imagePath.replace(/\\/g, "/").replace("public/", "");
  return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
};

const generateNumericFormId = () => uuidv4().replace(/\D/g, "").substring(0, 6);

const deleteOldImage = (imagePath) => {
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error("Error deleting old image:", error.message);
    }
  }
};

// ───────────── Courses ───────────── //
export const addCourse = async (req, res) => {
  const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

  try {
    const {
      courseName,
      description,
      duration,
      eligibility,
      courseType,
      feeStructure,
      careerOpportunities,
    } = req.body;

    const modules = [];
    let i = 0;
    while (req.body[`modules[${i}].name`] || req.body[`modules[${i}].syllabus`]) {
      modules.push({
        name: req.body[`modules[${i}].name`] || "",
        syllabus: req.body[`modules[${i}].syllabus`] || "",
      });
      i++;
    }

    if (!['UG', 'PG','Add on course'].includes(courseType)) {
      return res.status(400).json({ status: false, message: "Invalid course type." });
    }

    const newCourse = new Course({
      courseId: generateNumericFormId(),
      courseName,
      description,
      duration,
      eligibility,
      courseType,
      image: imagePath,
      modules,   
      feeStructure,
      careerOpportunities
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      status: true,
      message: "Course added successfully!",
      data: {
        ...savedCourse._doc,
        imageUrl: getImageUrl(req, imagePath)
      }
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({ status: false, message: "Failed to add course", error: error.message });
  }
};


export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    const response = courses.map(course => ({
      ...course._doc,
      imageUrl: getImageUrl(req, course.image)
    }));
    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to retrieve courses", error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });

    const response = {
      ...course._doc,
      imageUrl: getImageUrl(req, course.image),
    };

    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to retrieve course", error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  let newImagePath;

  try {
    const { courseId } = req.params;
    const {
      courseName,
      description,
      duration,
      eligibility,
      courseType,
      feeStructure,
      careerOpportunities,
    } = req.body;

    const modules = [];
    let i = 0;
    while (req.body[`modules[${i}].name`] || req.body[`modules[${i}].syllabus`]) {
      modules.push({
        name: req.body[`modules[${i}].name`] || "",
        syllabus: req.body[`modules[${i}].syllabus`] || "",
      });
      i++;
    }

    const course = await Course.findOne({ courseId });
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });

    if (req.file && course.image) {
      deleteOldImage(path.join(process.cwd(), course.image));
    }

    newImagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : course.image;

    const updatedCourse = await Course.findOneAndUpdate(
      { courseId },
      {
        courseName,
        description,
        duration,
        eligibility,
        courseType,
        image: newImagePath,
        modules,
        feeStructure,
        careerOpportunities
      },
      { new: true }
    );

    res.json({
      status: true,
      message: "Course updated successfully",
      data: {
        ...updatedCourse._doc,
        imageUrl: getImageUrl(req, updatedCourse.image)
      }
    });
  } catch (error) {
    if (newImagePath && fs.existsSync(path.join(process.cwd(), newImagePath))) {
      deleteOldImage(path.join(process.cwd(), newImagePath));
    }
    res.status(500).json({ status: false, message: "Failed to update course", error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOneAndDelete({ courseId });
    if (!course) return res.status(404).json({ status: false, message: "Course not found" });

    if (course.image) {
      deleteOldImage(path.join(process.cwd(), course.image));
    }
    res.json({ status: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to delete course", error: error.message });
  }
};

// ───────────── Faculty ───────────── //
export const addFaculty = async (req, res) => {
  try {
    const { name, email, contact, place, jobTitle, category, department } = req.body;

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

    const newFaculty = new Faculty({
      facultyId: generateNumericFormId(),
      name,
      email,
      contact,
      place,
      jobTitle,
      category,
      department,
      image: imagePath,
    });

    await newFaculty.save();

    res.status(201).json({
      status: true,
      message: "Faculty added successfully!",
      data: {
        ...newFaculty._doc,
        imageUrl: getImageUrl(req, newFaculty.image)
      },
    });
  } catch (error) {
    if (req.file) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to add faculty",
      error: error.message,
    });
  }
};

export const getFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find();

    const response = faculties.map((faculty) => ({
      ...faculty._doc,
      imageUrl: getImageUrl(req, faculty.image)
    }));

    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve faculty",
      error: error.message,
    });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      return res.status(404).json({
        status: false,
        message: "Faculty not found",
      });
    }

    if (req.file && faculty.image) {
      deleteOldImage(path.join(process.cwd(), faculty.image));
    }

    const newImagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : faculty.image;

    const { name, email, contact, place, jobTitle, category, department } = req.body;

    const updatedFaculty = await Faculty.findOneAndUpdate(
      { facultyId },
      { name, email, contact, place, jobTitle, category, department, image: newImagePath },
      { new: true }
    );

    res.json({
      status: true,
      message: "Faculty updated successfully",
      data: {
        ...updatedFaculty._doc,
        imageUrl: getImageUrl(req, updatedFaculty.image)
      },
    });
  } catch (error) {
    if (newImagePath) {
      deleteOldImage(path.join(process.cwd(), newImagePath));
    }
    res.status(500).json({
      status: false,
      message: "Error updating faculty",
      error: error.message,
    });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log(facultyId)
    const faculty = await Faculty.findOneAndDelete({ facultyId });
    if (!faculty) {
      return res.status(404).json({
        status: false,
        message: "Faculty not found",
      });
    }

    if (faculty.image) {
      deleteOldImage(path.join(process.cwd(), faculty.image));
    }

    res.json({
      status: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting faculty",
      error: error.message,
    });
  }
};

// ───────────── Board Members ───────────── //
export const addBoardMember = async (req, res) => {
  try {
    const { name, email, contact, place, jobTitle, category, department, type } = req.body;

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;
    console.log("image path",imagePath)

    const newBoardMember = new BoardMember({
      memberId: uuidv4(),
      name,
      email,
      contact,
      place,
      jobTitle,
      category,
      department,
      type,
      image: imagePath,
    });

    await newBoardMember.save();

    res.status(201).json({
      status: true,
      message: "Board member added successfully!",
      data: {
        ...newBoardMember._doc,
        imageUrl: getImageUrl(req, imagePath)
      },
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to add board member",
      error: error.message,
    });
  }
};

export const getBoardMembers = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const members = await BoardMember.find(filter);

    const response = members.map((member) => ({
      ...member._doc,
      imageUrl: getImageUrl(req, member.image)
    }));

    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve board members",
      error: error.message,
    });
  }
};

export const updateBoardMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await BoardMember.findOne({ memberId });
    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Board member not found",
      });
    }

    if (req.file && member.image) {
      deleteOldImage(path.join(process.cwd(), member.image));
    }

    const newImagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : member.image;

    const { name, email, contact, place, jobTitle, category, department, type } = req.body;

    const updatedMember = await BoardMember.findOneAndUpdate(
      { memberId },
      { name, email, contact, place, jobTitle, category, department, type, image: newImagePath },
      { new: true }
    );

    res.json({
      status: true,
      message: "Board member updated successfully",
      data: {
        ...updatedMember._doc,
        imageUrl: getImageUrl(req, updatedMember.image)
      },
    });
  } catch (error) {
    if (newImagePath) {
      deleteOldImage(path.join(process.cwd(), newImagePath));
    }
    res.status(500).json({
      status: false,
      message: "Error updating board member",
      error: error.message,
    });
  }
};

export const deleteBoardMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await BoardMember.findOneAndDelete({ memberId });
    if (!member) {
      return res.status(404).json({
        status: false,
        message: "Board member not found",
      });
    }

    if (member.image) {
      deleteOldImage(path.join(process.cwd(), member.image));
    }

    res.json({
      status: true,
      message: "Board member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting board member",
      error: error.message,
    });
  }
};

// ───────────── Placements ───────────── //
export const addPlacement = async (req, res) => {
  try {
    const { name, company, designation, salary, location } = req.body;

    if (!name || !company || !designation || !salary || !location) {
      return res.status(400).json({ status: false, message: "All fields are required." });
    }

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

    const newPlacement = new Placement({
      placementId: generateNumericFormId(),
      name,
      company,
      designation,
      salary,
      location,
      image: imagePath,
    });

    await newPlacement.save();

    res.status(201).json({
      status: true,
      message: "Placement added successfully!",
      data: {
        ...newPlacement._doc,
        imageUrl: getImageUrl(req, newPlacement.image)
      },
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to add placement",
      error: error.message,
    });
  }
};

export const getPlacement = async (req, res) => {
  try {
    const placements = await Placement.find();

    const response = placements.map((placement) => ({
      ...placement._doc,
      imageUrl: getImageUrl(req, placement.image)
    }));

    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve placements",
      error: error.message
    });
  }
};

export const updatePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ status: false, message: "Placement not found" });
    }

    if (req.file && placement.image) {
      deleteOldImage(path.join(process.cwd(), placement.image));
    }

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/")
      : placement.image;

    const { name, company, designation, salary, location } = req.body;

    const updatedPlacement = await Placement.findByIdAndUpdate(
      id,
      { name, company, designation, salary, location, image: imagePath },
      { new: true }
    );

    res.json({
      status: true,
      message: "Placement updated successfully",
      data: {
        ...updatedPlacement._doc,
        imageUrl: getImageUrl(req, updatedPlacement.image)
      },
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to update placement",
      error: error.message,
    });
  }
};

export const deletePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    const placement = await Placement.findByIdAndDelete(id);

    if (!placement) {
      return res.status(404).json({ status: false, message: "Placement not found" });
    }

    if (placement.image) {
      deleteOldImage(path.join(process.cwd(), placement.image));
    }

    res.json({ status: true, message: "Placement deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete placement",
      error: error.message
    });
  }
};

// ───────────── Rank Holders ───────────── //
export const addRankHolder = async (req, res) => {
  try {
    const { name, contact, place, rank, department, course, mark } = req.body;

    if (!name || !contact || !place || !rank || !course || !mark) {
      return res.status(400).json({ status: false, message: "All required fields must be filled." });
    }

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : null;

    const newRankHolder = new RankHolder({
      name,
      contact,
      place,
      rank,
      department,
      course,
      mark,
      image: imagePath,
    });

    await newRankHolder.save();

    res.status(201).json({
      status: true,
      message: "Rank holder added successfully!",
      data: {
        ...newRankHolder._doc,
        imageUrl: getImageUrl(req, newRankHolder.image)
      },
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to add rank holder",
      error: error.message,
    });
  }
};

export const getRankHolders = async (req, res) => {
  try {
    const rankHolders = await RankHolder.find();

    const response = rankHolders.map((holder) => ({
      ...holder._doc,
      imageUrl: getImageUrl(req, holder.image)
    }));

    res.json({ status: true, data: response });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve rank holders",
      error: error.message,
    });
  }
};

export const updateRankHolder = async (req, res) => {
  try {
    const { id } = req.params;

    const rankHolder = await RankHolder.findById(id);
    if (!rankHolder) {
      return res.status(404).json({ status: false, message: "Rank holder not found" });
    }

    if (req.file && rankHolder.image) {
      deleteOldImage(path.join(process.cwd(), rankHolder.image));
    }

    const imagePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : rankHolder.image;

    const { name, contact, place, rank, department, course, mark } = req.body;

    const updatedRankHolder = await RankHolder.findByIdAndUpdate(
      id,
      { name, contact, place, rank, department, course, mark, image: imagePath },
      { new: true }
    );

    res.json({
      status: true,
      message: "Rank holder updated successfully",
      data: {
        ...updatedRankHolder._doc,
        imageUrl: getImageUrl(req, updatedRankHolder.image)
      },
    });
  } catch (error) {
    if (imagePath) {
      deleteOldImage(path.join(process.cwd(), imagePath));
    }
    res.status(500).json({
      status: false,
      message: "Failed to update rank holder",
      error: error.message,
    });
  }
};

export const deleteRankHolder = async (req, res) => {
  try {
    const { id } = req.params;

    const rankHolder = await RankHolder.findByIdAndDelete(id);
    if (!rankHolder) {
      return res.status(404).json({ status: false, message: "Rank holder not found" });
    }

    if (rankHolder.image) {
      deleteOldImage(path.join(process.cwd(), rankHolder.image));
    }

    res.json({ status: true, message: "Rank holder deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete rank holder",
      error: error.message,
    });
  }
};

