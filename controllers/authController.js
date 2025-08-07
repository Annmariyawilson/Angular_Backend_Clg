import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Admin, SuperAdmin } from "../models/schemaModels.js";
import dotenv from "dotenv";

dotenv.config({ path: "../bin/.env" });

// **Utility Function: Validate user credentials**
const findUserByRole = async (email, role) => {
  return role === "superadmin"
    ? await SuperAdmin.findOne({ email })
    : await Admin.findOne({ email });
};

// **Super Admin Signup**
export const superAdminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) return res.status(409).json({ message: "Super Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSuperAdmin = new SuperAdmin({ name, email, password: hashedPassword });

    await newSuperAdmin.save();
    res.status(201).json({ message: "Super Admin registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Error during Super Admin registration" });
  }
};

// **Admin Signup (Only Super Admin can create Admins)**
export const createAdmin = async (req, res) => {
  const { superAdminEmail, name, email, password, code } = req.body;
  const accessCode = "hccmat@adm1n";

  try {
    if (code !== accessCode) {
      return res.status(401).json({ message: "Invalid access code" });
    }

    const superAdmin = await SuperAdmin.findOne({ email: superAdminEmail });
    if (!superAdmin) return res.status(403).json({ message: "Unauthorized access" });

    if (await Admin.findOne({ email })) return res.status(409).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Create Admin Error:", error.message);
    res.status(500).json({ message: "Error creating Admin" });
  }
};



// **Login for Admin/Super Admin**
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const superAdminEmail = process.env.SUPERADMIN;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;


    if (email === superAdminEmail) {
      // Validate password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, superAdminPassword);
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
      const token = jwt.sign({ email, role: "superadmin" }, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });

      return res.status(200).json({ message: "Login successful", token });
    }

    // Check in the database if not a super admin
    const user = await findUserByRole(email, role);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Error during login" });
  }
};


// **Admin Deletion (Only Super Admin)**
export const deleteAdmin = async (req, res) => {
  try {
    const { superAdminEmail, adminEmail } = req.body;
    const superAdmin = await SuperAdmin.findOne({ email: superAdminEmail });

    if (!superAdmin) return res.status(403).json({ message: "Unauthorized access" });
    const admin = await Admin.findOneAndDelete({ email: adminEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete Admin Error:", error.message);
    res.status(500).json({ message: "Error deleting Admin" });
  }
};
