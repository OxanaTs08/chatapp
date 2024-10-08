import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.slice(7);
      jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = user;
        next();
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    req.status(500).send(error);
  }
};

export default authenticateJWT;
