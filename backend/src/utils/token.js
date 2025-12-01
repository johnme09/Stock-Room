import jwt from "jsonwebtoken";

export const signToken = (userId, secret, expiresIn = "7d") => {
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn });
};

export const verifyToken = (token, secret) => {
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return jwt.verify(token, secret);
};

