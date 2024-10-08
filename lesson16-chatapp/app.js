import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import User from "./models/userModel.js";
import Message from "./models/messageModel.js";
import Room from "./models/roomModel.js";

dotenv.config({ path: ".env" });
const port = 4001;
const uri = process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/auth", authRouter);
app.use("/users", usersRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Set();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let currentUserId = null;
  let chatRoom = null;

  socket.on("join", async ({ username, senderId }) => {
    currentUserId = senderId;
    socket.join(currentUserId);
    console.log("Current user ID in join in app:", currentUserId);
    console.log("Current username in join in app:", username);
  });

  socket.on("selectedtUser", async ({ receiverId }) => {
    if (!currentUserId && !receiverId) {
      console.log("user is not in a chat room");
    }

    console.log("Current user ID in server:", currentUserId);
    console.log("Receiver ID in server:", receiverId);

    let room = await Room.findOne({
      participants: { $all: [currentUserId, receiverId] },
    });

    console.log("receiver id in app", receiverId);

    if (!room) {
      room = new Room({
        participants: [currentUserId, receiverId],
        messages: [],
      });
      await room.save();
    }

    console.log("Room:", room);

    chatRoom = room._id;
    socket.join(chatRoom);

    const previousMessages = await Message.find({ room: chatRoom }).populate(
      "sender",
      "username"
    );
    socket.emit("previousMessages", previousMessages);

    socket.on("sendMessage", async ({ message }) => {
      if (!chatRoom) {
        console.log("user is not in a chat room");
        return;
      }
      const newMessage = new Message({
        room: chatRoom,
        sender: currentUserId,
        content: message,
      });
      await newMessage.save();

      await Room.findByIdAndUpdate(chatRoom, {
        $push: { messages: newMessage._id },
      });
      io.to(chatRoom).emit("message", {
        data: {
          user: {
            name: currentUserId,
            message,
          },
        },
      });
    });

    socket.on("leftRoom", async () => {
      if (currentUserId) {
        socket.leave(chatRoom);
        handleUserLeave(currentUserId);
      }
    });
  });
});

async function handleUserLeave(currentUserId) {
  connectedUsers.delete(currentUserId);

  const user = await User.findById(currentUserId);
  if (user) {
    io.emit("message", {
      data: {
        user: {
          username: user.username,
          message: `${user.username} has left the chat`,
        },
      },
    });
  }
}

mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Mongoose Database connected successfully");
  })
  .catch((error) => {
    console.log("Mongoose connection failed:", error);
  });

server.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
