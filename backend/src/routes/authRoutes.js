import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateRequest from "../middleware/validateRequest.js";
import { signToken } from "../utils/token.js";
import { HttpError } from "../utils/httpError.js";
import { serializeUser } from "../serializers/userSerializer.js";

const router = express.Router();

const registerValidators = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 25 })
    .withMessage("Username must be 3-25 characters long"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

router.post(
  "/register",
  registerValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const [existingUsername, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (existingUsername) {
      throw new HttpError(409, "Username already taken");
    }

    if (existingEmail) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    const token = signToken(user.id, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: serializeUser(user),
    });
  })
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken(user.id, process.env.JWT_SECRET);
    res.json({
      token,
      user: serializeUser(user),
    });
  })
);

export default router;

