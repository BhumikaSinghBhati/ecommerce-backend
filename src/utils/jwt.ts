import jwt, { SignOptions } from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

export const generateToken = (userId: string): string => {
  const payload: JwtPayload = { id: userId };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};
