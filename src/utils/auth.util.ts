import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../api-errors/api-error.util';
import { DecodedToken } from '../modules/auth/auth.type';

// Generate a JSON Web Token (JWT) with an optional expiration time
export const generateJWT = (id: any, expiresIn?:string) => {
  const expiresInJwt = expiresIn ? expiresIn : '7d';
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'jwtsecrettoken', { expiresIn: expiresInJwt });
  return token;
};

// Verify a JWT from the request header and set email and token in the request query
export const authenticateJwt = (req: Request, res: Response, next:NextFunction) => {
  try {
    if (req.headers.authorization) {

      const token = req.headers.authorization.split(' ')[1]; // Remove the "Bearer" prefix
      if (!token) {
        return next(ApiError.unAuthorized());
      }
      const decoded: DecodedToken = verifyJWT(token);
      // req.query.email = decoded.id.email;
      
      req.query.userId = String(decoded.id);
      // req.query.token = token;
      next();
    } else {
      next(ApiError.unAuthorized());
    }
  } catch (error) {
    next(error);
  }
};

export const verifyJWT = (token:string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'jwtsecrettoken') as DecodedToken;
}

// Hash a value using bcrypt
export const hash = (value:string) => {
  const hashedValue = bcrypt.hash(value, 12);
  return hashedValue;
};

// Compare a value with a previously hashed value
export const compare = (value:string, compareValue:string) => {
  const matchedValue = bcrypt.compare(value, compareValue);
  return matchedValue;
};

// Generate a random 6-digit OTP (One-Time Password)
export const generateOTP = () => {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
};

// Generate a random password with 8 characters
export function generateRandomPassword() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}