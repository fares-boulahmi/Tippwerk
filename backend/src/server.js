import "dotenv/config";
import path from "path";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const missing = ["MONGODB_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"].filter(
  (k) => !process.env[k],
);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

await connectDB(process.env.MONGODB_URI);

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`),
);
