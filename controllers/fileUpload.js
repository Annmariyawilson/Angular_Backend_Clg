import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine upload folder based on route
const getUploadFolder = (req) => {
  const routePath = `${req.baseUrl}${req.path}`.toLowerCase();

  if (routePath.includes("achievement")) return "achievement"; 
  if (routePath.includes("event")) return "events";
  if (routePath.includes("faculty")) return "faculty";
  if (routePath.includes("board")) return "board_members";
  if (routePath.includes("campusnews")) return "campus_news"; 
  if (routePath.includes("universitynews")) return "university_news";
  if (routePath.includes("course")) return "courses";
  if (routePath.includes("placement")) return "placements";
  if (routePath.includes("rank")) return "rank_holders";
  if (routePath.includes("testimonial")) return "testimonials";

  return "others";
};

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(req);
    const uploadDir = path.join(__dirname, "../public/uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📂 Created upload directory:", uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Image file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);
  isValidExt && isValidMime ? cb(null, true) : cb(new Error("Only image files are allowed"));
};

// Exported upload handler
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single("image");

export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err.message);
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};
