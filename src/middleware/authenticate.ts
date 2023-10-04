import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../model/userSchema';
import dotenv from 'dotenv';

dotenv.config();

interface CustomRequest extends Request {
  user?: JwtPayload; 
}

export default async function authenticate(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;

    // Fetch the user from the database using the user's ID from the decoded token
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Set the user information in the request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
