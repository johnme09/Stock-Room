import mongoose from "mongoose";

const userItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    status: {
      type: String,
      enum: ["have", "want", "dont_have"],
      default: "dont_have",
    },
  },
  { timestamps: true }
);

userItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

userItemSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const UserItem = mongoose.model("UserItem", userItemSchema);

export default UserItem;

