import mongoose from "mongoose";

/* -----------------------------------------------
   Enquiry Form Schema
-------------------------------------------------- */
const enquiryFormSchema = new mongoose.Schema(
  {
    formId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    contactNo: { type: String, required: true },
    presentAddress: { type: String, required: true },
    nationality: { type: String, required: true },
    areaOfStudy: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true },
    referredBy: { type: String, default: '' },
    dob: { type: Date, required: true },
    sex: {
      type: String,
      enum: ["Male", "Female", "Transgender"],
      required: true,
    },
    comments: { type: String },
    formStatus: {
      type: String,
      enum: ["completed", "pending", "rejected", "approved"],
      default: "pending",
    },
    formViewedStatus: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EnquiryForm = mongoose.model("EnquiryForm", enquiryFormSchema);

/* -----------------------------------------------
   Enquiry Form Count Schema
-------------------------------------------------- */
const formCountSchema = new mongoose.Schema(
  {
    completed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    approved: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FormCount = mongoose.model("FormCount", formCountSchema);

/* -----------------------------------------------
   Contact Form Schema
-------------------------------------------------- */
const contactSchema = new mongoose.Schema(
  {
    contactId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    termsAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "pending",
        "viewed",
        "replied",
        "closed",
        "completed",
      ],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ContactForm = mongoose.model("ContactForm", contactSchema);

/* -----------------------------------------------
   Contact Form Count Schema
-------------------------------------------------- */
const contactFormCountSchema = new mongoose.Schema(
  {
    pending: { type: Number, default: 0 },
    approved: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    viewed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ContactFormCount = mongoose.model("ContactFormCount", contactFormCountSchema);

/* -----------------------------------------------
   Event Schema
-------------------------------------------------- */
const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    targetAudience: { type: String },
    eventDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    totalSlots: { type: Number, required: true },
    bookedSlots: { type: Number, default: 0 },
    eventStatus: {
      type: String,
      enum: ["completed", "upcoming", "canceled"],
      default: "upcoming",
    },
    image: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

/* -----------------------------------------------
   Event Count Schema
-------------------------------------------------- */
const eventCountSchema = new mongoose.Schema(
  {
    completed: { type: Number, default: 0 },
    upcoming: { type: Number, default: 0 },
    canceled: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const EventCount = mongoose.model("EventCount", eventCountSchema);

/* -----------------------------------------------
   Campus News Schema
-------------------------------------------------- */
const campusNewsSchema = new mongoose.Schema(
  {
    newsId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const CampusNews = mongoose.model("CampusNews", campusNewsSchema);

/* -----------------------------------------------
   Campus Achievement Schema
-------------------------------------------------- */
const campusAchievementSchema = new mongoose.Schema(
  {
    achievementId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    achievementType: { type: String, default: 'OTHER' }, 
    date: { type: Date, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const CampusAchievement = mongoose.model("CampusAchievement", campusAchievementSchema);



/* -----------------------------------------------
   University News Schema
-------------------------------------------------- */
const universityNewsSchema = new mongoose.Schema(
  {
    newsId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const UniversityNews = mongoose.model("UniversityNews", universityNewsSchema);

/* -----------------------------------------------
   Faculty Schema
-------------------------------------------------- */
const facultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    place: { type: String, required: true },
    jobTitle: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Faculty = mongoose.model("Faculty", facultySchema);

/* -----------------------------------------------
   Board Member Schema
-------------------------------------------------- */
const boardMemberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    place: { type: String, required: true },
    jobTitle: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    type: {
      type: String,
      enum: ["Board Member", "Visionary"],
      default: "Board Member",
    },
    image: { type: String },
  },
  { timestamps: true }
);

const BoardMember = mongoose.model("BoardMember", boardMemberSchema);

/* -----------------------------------------------
   Course Schema
-------------------------------------------------- */
const courseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    description: { type: String },
    duration: { type: String, required: true },
    eligibility: { type: String, required: true },
    courseType: {
      type: String,
      enum: ["UG", "PG", "Add on course" ],
      required: true,
    },
    image: { type: String },
    modules: [
    {
      name: { type: String },
      syllabus: { type: String },
    },
  ], 
    feeStructure: { type: String },
    careerOpportunities: { type: String },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);


/* -----------------------------------------------
   Student Placement Schema
-------------------------------------------------- */
const studentPlacementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    designation: { type: String, required: true },
    salary: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Placement = mongoose.model("Placement", studentPlacementSchema);

/* -----------------------------------------------
   Rank Holder Schema
-------------------------------------------------- */
const rankHolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    place: { type: String, required: true },
    rank: { type: String, required: true },
    department: { type: String },
    course: { type: String, required: true },
    mark: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const RankHolder = mongoose.model("RankHolder", rankHolderSchema);
/* -----------------------------------------------
  Testimonial Schema
-------------------------------------------------- */
const testimonialSchema = new mongoose.Schema(
  {
    testimonialId: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    name: { type: String, required: true },
    profession: { type: String, required: true },
    image: { type: String, required: true }
  }, 
  { timestamps: true }
);
 
const Testimonial = mongoose.model("Testimonial", testimonialSchema)

/* -----------------------------------------------
   Admin Schema
-------------------------------------------------- */
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

/* -----------------------------------------------
   Super Admin Schema
-------------------------------------------------- */
const superAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

/* -----------------------------------------------
   Exporting All Models
-------------------------------------------------- */
export {
  EnquiryForm,
  FormCount,
  ContactForm,
  ContactFormCount,
  Event,
  EventCount,
  Course,
  CampusNews,
  UniversityNews,
  Faculty,
  BoardMember,
  Placement,
  RankHolder,
  Testimonial,
  Admin,
  SuperAdmin,
  CampusAchievement,
};
