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
    if (req.query.owned) {
      if (!req.user) {
        throw new HttpError(401, "Authentication required to filter owned communities");
      }
      filters.ownerId = req.user.id;
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
    const community = await Community.findById(req.params.communityId).populate(
      "moderators",
      "username"
    );
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
    const items = await Item.find({ communityId: req.params.communityId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");
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
    ensureOwnerOrMod(community, req.user.id);

    const item = await Item.create({
      communityId: community.id,
      title: req.body.title,
      description: req.body.description ?? "",
      image: req.body.image ?? "",
      createdBy: req.user.id,
    });

    await item.populate("createdBy", "username");

    res.status(201).json({ item });
  })
);

import ForumPost from "../models/ForumPost.js";

// ... existing code ...

router.get(
  "/:communityId/posts",
  [param("communityId").isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }
    const posts = await ForumPost.find({ communityId: req.params.communityId })
      .sort({ createdAt: -1 })
      .populate("authorId", "username image");
    res.json({ posts });
  })
);

router.post(
  "/:communityId/posts",
  auth(),
  [
    param("communityId").isMongoId(),
    body("content").isLength({ min: 1, max: 500 }).withMessage("Content is required"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }

    const post = await ForumPost.create({
      communityId: community.id,
      content: req.body.content,
      authorId: req.user.id,
    });

    // Populate author info for immediate display
    await post.populate("authorId", "username image");

    res.status(201).json({ post });
  })
);

router.delete(
  "/:communityId/posts/:postId",
  auth(),
  [param("communityId").isMongoId(), param("postId").isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }

    const post = await ForumPost.findOne({
      _id: req.params.postId,
      communityId: community.id,
    });

    if (!post) {
      throw new HttpError(404, "Post not found");
    }

    // Allow deletion if user is community owner OR post author OR moderator
    const isOwner = community.ownerId.toString() === req.user.id;
    const isAuthor = post.authorId.toString() === req.user.id;
    const isMod = community.moderators.some((mod) => mod.toString() === req.user.id);

    if (!isOwner && !isAuthor && !isMod) {
      throw new HttpError(403, "You do not have permission to delete this post");
    }

    await post.deleteOne();

    res.status(204).end();
  })
);

import User from "../models/User.js";

// Helper to check if user is owner or moderator
const ensureOwnerOrMod = (community, userId) => {
  const isOwner = community.ownerId.toString() === userId.toString();
  const isMod = community.moderators?.some((mod) => mod.toString() === userId.toString());
  if (!isOwner && !isMod) {
    throw new HttpError(403, "Only the community owner or moderators can perform this action");
  }
};

router.put(
  "/:communityId/moderators",
  auth(),
  [
    param("communityId").isMongoId(),
    body("username").isString().notEmpty(),
    body("action").isIn(["add", "remove"]),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new HttpError(404, "Community not found");
    }

    ensureOwner(community, req.user.id);

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (req.body.action === "add") {
      if (community.moderators.includes(user.id)) {
        throw new HttpError(400, "User is already a moderator");
      }
      community.moderators.push(user.id);
    } else {
      community.moderators = community.moderators.filter(
        (id) => id.toString() !== user.id.toString()
      );
    }

    await community.save();
    res.json({ community });
  })
);

export default router;

