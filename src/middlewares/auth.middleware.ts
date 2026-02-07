import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

interface JwtPayload {
  id: string;
}

// Protect routes (logged-in users only)
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 3. Get user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 4. Attach user to request
    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((req as any).user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

