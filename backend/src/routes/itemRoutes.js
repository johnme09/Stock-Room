import express from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import Item from "../models/Item.js";
import Community from "../models/Community.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const ensureCommunityOwnerOrMod = async (item, userId) => {
  const community = await Community.findById(item.communityId);
  if (!community) {
    throw new HttpError(404, "Community not found");
  }

  const isOwner = community.ownerId.toString() === userId.toString();
  const isMod = community.moderators?.some((mod) => mod.toString() === userId.toString());

  if (!isOwner && !isMod) {
    throw new HttpError(403, "Only the community owner or moderators can manage items");
  }
};

router.patch(
  "/:itemId",
  auth(),
  [
    param("itemId").isMongoId(),
    body("title").optional().isLength({ min: 2, max: 100 }),
    body("description").optional().isLength({ max: 1000 }),
    body("image").optional().isURL(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    await ensureCommunityOwnerOrMod(item, req.user.id);

    if (req.body.title) item.title = req.body.title;
    if (typeof req.body.description === "string") item.description = req.body.description;
    if (typeof req.body.image === "string") item.image = req.body.image;

    await item.save();
    res.json({ item });
  })
);

router.delete(
  "/:itemId",
  auth(),
  [param("itemId").isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    await ensureCommunityOwnerOrMod(item, req.user.id);
    await item.deleteOne();

    res.status(204).end();
  })
);

export default router;

