import express from "express";
import { body, query } from "express-validator";
import auth from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import UserItem from "../models/UserItem.js";
import Item from "../models/Item.js";
import { HttpError } from "../utils/httpError.js";

const router = express.Router();

const statusOptions = ["have", "want", "dont_have"];

router.get(
  "/",
  auth(),
  [query("communityId").optional().isMongoId()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const filters = { userId: req.user.id };
    if (req.query.communityId) {
      filters.communityId = req.query.communityId;
    }

    const statuses = await UserItem.find(filters).populate({
      path: "itemId",
    });

    res.json({
      userItems: statuses.map((entry) => ({
        id: entry.id,
        status: entry.status,
        item: entry.itemId?.toJSON(),
      })),
    });
  })
);

router.put(
  "/",
  auth(),
  [
    body("itemId").isMongoId().withMessage("itemId is required"),
    body("status")
      .isIn(statusOptions)
      .withMessage(`Status must be one of ${statusOptions.join(", ")}`),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { itemId, status } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    const updated = await UserItem.findOneAndUpdate(
      { userId: req.user.id, itemId },
      { status, communityId: item.communityId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ userItem: updated });
  })
);

export default router;

