import express from "express";
import { body, param, query } from "express-validator";
import auth from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import Community from "../models/Community.js";
import Item from "../models/Item.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const ensureOwner = (community, userId) => {
  if (community.ownerId.toString() !== userId.toString()) {
    throw new HttpError(403, "Only the community owner can perform this action");
  }
};

router.get(
  "/",
  auth({ required: false }),
  [
    query("q").optional().isString(),
    query("favoriteOnly").optional().isBoolean().toBoolean(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { q, favoriteOnly } = req.query;

    const filters = {};
    if (q) {
      filters.title = { $regex: q, $options: "i" };
    }
    if (favoriteOnly) {
      if (!req.user) {
        throw new HttpError(401, "Authentication required to filter favorites");
      }
      filters._id = { $in: req.user.favorites };
    }

    const communities = await Community.find(filters).sort({ createdAt: -1 });
    res.json({ communities });
  })
);

router.post(
  "/",
  auth(),
  [
    body("title").isLength({ min: 3, max: 80 }).withMessage("Title is required"),
    body("description").isLength({ max: 1000 }).optional({ nullable: true }),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.create({
      title: req.body.title,
      description: req.body.description ?? "",
      image: req.body.image ?? "",
      ownerId: req.user.id,
    });

    res.status(201).json({ community });
  })
);

router.get(
  "/:communityId",
  [param("communityId").isMongoId().withMessage("Invalid community id")],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }
    res.json({ community });
  })
);

router.patch(
  "/:communityId",
  auth(),
  [
    param("communityId").isMongoId(),
    body("title").optional().isLength({ min: 3, max: 80 }),
    body("description").optional().isLength({ max: 1000 }),
    body("image").optional().isURL(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }

    ensureOwner(community, req.user.id);

    if (req.body.title) community.title = req.body.title;
    if (typeof req.body.description === "string") {
      community.description = req.body.description;
    }
    if (typeof req.body.image === "string") {
      community.image = req.body.image;
    }

    await community.save();
    res.json({ community });
  })
);

router.delete(
  "/:communityId",
  auth(),
  [param("communityId").isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }
    ensureOwner(community, req.user.id);

    await Item.deleteMany({ communityId: community.id });
    await community.deleteOne();

    res.status(204).end();
  })
);

router.get(
  "/:communityId/items",
  [param("communityId").isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }
    const items = await Item.find({ communityId: req.params.communityId }).sort({
      createdAt: -1,
    });
    res.json({ items });
  })
);

router.post(
  "/:communityId/items",
  auth(),
  [
    param("communityId").isMongoId(),
    body("title").isLength({ min: 2 }).withMessage("Title is required"),
    body("description").optional().isLength({ max: 1000 }),
    body("image").optional().isURL(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }
    ensureOwner(community, req.user.id);

    const item = await Item.create({
      communityId: community.id,
      title: req.body.title,
      description: req.body.description ?? "",
      image: req.body.image ?? "",
      createdBy: req.user.id,
    });

    res.status(201).json({ item });
  })
);

export default router;

