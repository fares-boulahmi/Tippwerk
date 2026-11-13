import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";

const googleClient = new OAuth2Client();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/google  { credential }  <- the Google ID token from the frontend button
export async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) throw new HttpError(400, "Missing Google credential");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, "Google sign-in could not be verified");
  }

  // First login creates the user (role defaults to 'admin'), later logins refresh the profile.
  const user = await User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        email: payload.email,
        name: payload.name || "",
        picture: payload.picture || "",
      },
    },
    { upsert: true, new: true },
  );

  res.json({ token: signToken(user), user });
}

// GET /api/auth/me
export function me(req, res) {
  res.json(req.user);
}
