import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  online: { type: Boolean, default: false },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export { userSchema };
