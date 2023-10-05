import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import {  validationResult } from 'express-validator';
import User from '../model/userSchema'




export const RegisterController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
   

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  try {
    
    const { name, email, password, display_name } = req.body;
     
      const existingUser = await User.findOne({ where: { email , display_name} });

      if (existingUser) {
        return res.status(400).json({ message: 'Email or display_name already exists' });
      }
 
      const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      display_name,
    });

   



    // Respond with success message or token
    res.json({ message: 'Signup successful', user });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};



export default RegisterController;