import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import communityRoutes from "./communityRoutes.js";
import itemRoutes from "./itemRoutes.js";
import userItemRoutes from "./userItemRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/communities", communityRoutes);
router.use("/items", itemRoutes);
router.use("/user-items", userItemRoutes);

export default router;

