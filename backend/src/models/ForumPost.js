import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

forumPostSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const ForumPost = mongoose.model("ForumPost", forumPostSchema);

export default ForumPost;
