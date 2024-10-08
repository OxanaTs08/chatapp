import mongoose from "mongoose";
import { roomSchema } from "../schemas/roomSchema.js";

const Room = mongoose.model("Room", roomSchema);

export default Room;
