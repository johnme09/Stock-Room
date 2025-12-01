import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpError.js";

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new HttpError(400, first.msg);
  }

  next();
};

export default validateRequest;

