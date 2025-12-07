import express from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import { serializeUser } from "../serializers/userSerializer.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

router.get(
  "/me",
  auth(),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json({
      user: serializeUser(user),
      favoriteCommunities: user.favorites,
    });
  })
);

router.get(
  "/:userId",
  auth({ required: false }),
  [param("userId").isMongoId().withMessage("Invalid user id")],
  validateRequest,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).populate("favorites");
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    res.json({
      user: serializeUser(user),
      favoriteCommunities: user.favorites,
    });
  })
);

router.patch(
  "/me",
  auth(),
  [body("about").optional().isLength({ max: 500 }).withMessage("About is too long"),
   body("image").optional().isURL()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const updates = {};
    if (typeof req.body.about === "string") {
      updates.about = req.body.about;
    }
    if (typeof req.body.image === "string") {
      updates.image = req.body.image;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).populate("favorites");

    res.json({ user: serializeUser(user) });
  })
);

router.post(
  "/me/favorites/:communityId",
  auth(),
  [param("communityId").isMongoId().withMessage("Invalid community id")],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }

    if (!req.user.favorites.map(String).includes(communityId)) {
      req.user.favorites.push(communityId);
      await req.user.save();
    }

    res.status(204).end();
  })
);

router.delete(
  "/me/favorites/:communityId",
  auth(),
  [param("communityId").isMongoId().withMessage("Invalid community id")],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    req.user.favorites = req.user.favorites.filter(
      (favId) => favId.toString() !== communityId
    );
    await req.user.save();
    res.status(204).end();
  })
);

export default router;

