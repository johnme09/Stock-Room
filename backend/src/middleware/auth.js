import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";
import { HttpError } from "../utils/httpError.js";
import User from "../models/User.js";

const authMiddleware = (options = { required: true }) =>
  asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.substring(7) : null;

    if (!token) {
      if (options.required) {
        throw new HttpError(401, "Authentication required");
      }
      return next();
    }

    const payload = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      if (options.required) {
        throw new HttpError(401, "Invalid authentication token");
      }
      return next();
    }

    req.user = user;
    next();
  });

export default authMiddleware;

