import express from "express";
import { uploadMiddleware } from "../controllers/fileUpload.js";
import { jwtMiddleware } from "../security/jwt.js";

// Import Controllers
import * as auth from "../controllers/authController.js";
import * as enquiry from "../controllers/enquiryController.js";
import * as event from "../controllers/eventController.js";
import * as news from "../controllers/newsController.js";
import * as site from "../controllers/siteController.js";
import * as achievement from "../controllers/achievementController.js";
import * as testimonial from "../controllers/testimonialController.js";

const hccmat = express();
hccmat.use(express.json());

const handleRequest = (handler) => async (req, res, next) => {
  try {
    const result = await handler(req, res, next);
    if (!res.headersSent) {
      res.status(result?.statusCode || 200).json(result);
    }
  } catch (error) {
    console.error("🚨 Request Error:", error.stack || error.message);
    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: error.message || "Unknown error occurred",
      });
    }
  }
};

// **AUTH ROUTES**
hccmat.post("/signup", handleRequest(auth.superAdminSignup));
hccmat.post("/login", handleRequest(auth.login));

// **ENQUIRY ROUTES**
hccmat.post("/submitForm", handleRequest(enquiry.addEnquiry));
hccmat.get("/view-enquiry/:formId", jwtMiddleware, handleRequest(enquiry.getEnquiryById));
hccmat.get("/getEnquiryList", jwtMiddleware, handleRequest(enquiry.getEnquiryList));
hccmat.put("/updateEnquiry", jwtMiddleware, handleRequest(enquiry.updateEnquiry));
hccmat.delete("/deleteEnquiry/:formId", jwtMiddleware, handleRequest(enquiry.deleteEnquiry));
hccmat.delete("/delete-multiple-enquiries", jwtMiddleware, handleRequest(enquiry.deleteMultipleEnquiriesByFormId));

// **CONTACT FORM ROUTES**
hccmat.post("/submit-contact", handleRequest(enquiry.submitContactForm));
hccmat.get("/contact-form-counts", jwtMiddleware, handleRequest(enquiry.getContactFormCounts));
hccmat.get("/get-contacts", jwtMiddleware, handleRequest(enquiry.getAllContacts));
hccmat.get("/contact/:contactId", jwtMiddleware, handleRequest(enquiry.getContactById));
hccmat.put("/update-contact", jwtMiddleware, handleRequest(enquiry.updateContactStatus));
hccmat.delete("/delete-contact/:contactId", jwtMiddleware, handleRequest(enquiry.deleteContact));


// **EVENT ROUTES**
hccmat.post("/create-Event", jwtMiddleware, uploadMiddleware, event.createEvent);
hccmat.get("/getEvents",event.getEvents );
hccmat.get("/getEventCount",event.getEventCount );
hccmat.get("/getEventById/:eventId", event.getEventById);
hccmat.put("/updateEvent/:eventId", uploadMiddleware, event.updateEvent);
hccmat.delete("/deleteEvent/:eventId", jwtMiddleware, event.deleteEvent);

// **COURSE ROUTES**
hccmat.post("/addCourse", jwtMiddleware, uploadMiddleware, handleRequest(site.addCourse));
hccmat.get("/getCourses", handleRequest(site.getCourses));
hccmat.get("/getCourseById/:courseId", handleRequest(site.getCourseById));
hccmat.put("/updateCourse/:courseId", jwtMiddleware, uploadMiddleware, handleRequest(site.updateCourse));
hccmat.delete("/deleteCourse/:courseId", jwtMiddleware, handleRequest(site.deleteCourse));

// **FACULTY ROUTES**
hccmat.post("/addFaculty", jwtMiddleware, uploadMiddleware, handleRequest(site.addFaculty));
hccmat.get("/getFaculty", handleRequest(site.getFaculty));
hccmat.put("/updateFaculty/:facultyId", jwtMiddleware, uploadMiddleware, handleRequest(site.updateFaculty));
hccmat.delete("/deleteFaculty/:facultyId", jwtMiddleware, handleRequest(site.deleteFaculty));

// **BOARD MEMBER ROUTES**
hccmat.post("/addBoardMember", jwtMiddleware, uploadMiddleware, handleRequest(site.addBoardMember));
hccmat.get("/getBoardMembers", handleRequest(site.getBoardMembers));
hccmat.put("/updateBoardMember/:memberId", jwtMiddleware, uploadMiddleware, handleRequest(site.updateBoardMember));
hccmat.delete("/deleteBoardMember/:memberId", jwtMiddleware, handleRequest(site.deleteBoardMember));

// **CAMPUS NEWS ROUTES**
hccmat.post("/addCampusNews", jwtMiddleware, uploadMiddleware, handleRequest(news.addCampusNews));
hccmat.put("/updateCampusNews/:id", jwtMiddleware, uploadMiddleware, handleRequest(news.updateCampusNews));
hccmat.delete("/deleteCampusNews/:id", jwtMiddleware, handleRequest(news.deleteCampusNews));
hccmat.get("/getCampusNews", handleRequest(news.getCampusNews));
hccmat.get("/getCampusNewsById/:newsId", handleRequest(news.getCampusNewsById));

// **UNIVERSITY NEWS ROUTES**
hccmat.post("/addUniversityNews", jwtMiddleware, uploadMiddleware, handleRequest(news.addUniversityNews));
hccmat.put("/updateUniversityNews/:id", jwtMiddleware, uploadMiddleware, handleRequest(news.updateUniversityNews));
hccmat.delete("/deleteUniversityNews/:id", jwtMiddleware, handleRequest(news.deleteUniversityNews));
hccmat.get("/getUniversityNews", handleRequest(news.getUniversityNews));
hccmat.get("/getUniversityNewsById/:newsId", handleRequest(news.getUniversityNewsById));

// **STUDENT PLACEMENT**
hccmat.post("/addPlacement", jwtMiddleware, uploadMiddleware, handleRequest(site.addPlacement));
hccmat.get("/getPlacement", handleRequest(site.getPlacement));
hccmat.put("/updatePlacement/:id", jwtMiddleware, uploadMiddleware, handleRequest(site.updatePlacement));
hccmat.delete("/deletePlacement/:id", handleRequest(site.deletePlacement));

// **RANK HOLDERS**
hccmat.post("/addRankHolder", jwtMiddleware, uploadMiddleware, handleRequest(site.addRankHolder));
hccmat.get("/getRankHolders", handleRequest(site.getRankHolders));
hccmat.put("/updateRankHolder/:id", jwtMiddleware, uploadMiddleware, handleRequest(site.updateRankHolder));
hccmat.delete("/deleteRankHolder/:id", handleRequest(site.deleteRankHolder));

// **ACHIEVEMENT ROUTES**
hccmat.post("/addCampusAchievement", jwtMiddleware, uploadMiddleware, achievement.addCampusAchievement);
hccmat.get("/getCampusAchievements", achievement.getCampusAchievements);
hccmat.get("/getCampusAchievementById/:achievementId", achievement.getAchievementById);
hccmat.put("/updateCampusAchievement/:achievementId",jwtMiddleware, uploadMiddleware, achievement.updateAchievement);
hccmat.delete("/deleteCampusAchievement/:achievementId", jwtMiddleware, achievement.deleteAchievement);

// Testimonial
hccmat.post("/addTestimonial", jwtMiddleware, uploadMiddleware, testimonial.addTestimonial);
hccmat.get("/getTestimonials", testimonial.getTestimonials);
hccmat.delete("/deleteTestimonial/:testimonialId", jwtMiddleware, testimonial.deleteTestimonial);


export default hccmat;
