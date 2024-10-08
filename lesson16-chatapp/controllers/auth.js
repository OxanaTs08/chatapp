import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const jwtSecret = process.env.JWT_SECRET;

export const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username and email and password are required" });
  }
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res
        .status(400)
        .json({ message: `User ${username}  already exists` });
    }

    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(password, hashRounds);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: `Duplicate username: ${username}` });
    } else {
      res.status(500).json(error);
    }
  }
};

export const loginController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      res.status(400).send("User not found");
      return;
    }
    if (foundUser) {
      const isPasswordValid = bcrypt.compare(password, foundUser.password);

      if (!isPasswordValid) {
        res.status(400).send("Invalid password");
        return;
      }

      const token = jwt.sign(
        { id: foundUser.id, username: foundUser.username },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      await User.findByIdAndUpdate(foundUser._id, { $set: { online: true } });

      res.status(200).json({ token, user: await User.findById(foundUser._id) });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    await User.findByIdAndUpdate(decoded.id, { $set: { online: false } });
    // localStorage.removeItem("token");
    res.status(200).json("User logged out");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const usersGetController = async (req, res) => {
  try {
    const users = await User.find();
    console.log("Users found:", users);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
};

export const usersOnlineGetController = async (req, res) => {
  try {
    const users = await User.find({ online: true });
    console.log("Users found:", users);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
};

export const userReceiverByIdGetController = async (req, res) => {
  try {
    const { receiverId } = req.query;
    console.log({ receiverId });
    const user = await User.findById(receiverId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User by Id found:", user);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
};
