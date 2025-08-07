import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config({ path: "../bin/.env" });

// **Middleware for JWT Validation**
export const jwtMiddleware = (req, res, next) => {
  const token = req.headers["hccmatjwt"];
  if (!token) {
    return res.status(401).json({ status: false, message: "Unauthorized: Token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure the secret matches with token generation
    req.user = decoded.jwtuser; // Attach user info to the request object
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(403).json({ status: false, message: "Unauthorized: Invalid or expired token" });
  }
};
