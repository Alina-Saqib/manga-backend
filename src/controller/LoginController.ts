import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../model/userSchema';

export const LoginController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
   

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
   
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Use bcrypt to compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(402).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as Secret, {
      expiresIn: '7d', 
    });

  
    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export default LoginController;
