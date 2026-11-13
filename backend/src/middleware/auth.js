import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Not authenticated");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, "User no longer exists");

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") throw new HttpError(403, "Admins only");
  next();
}
