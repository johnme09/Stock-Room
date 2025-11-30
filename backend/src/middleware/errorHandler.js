import { HttpError } from "../utils/httpError.js";

const errorHandler = (err, _req, res, _next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;

