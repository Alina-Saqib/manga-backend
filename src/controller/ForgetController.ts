import { Request, Response } from "express"
import User from "../model/userSchema";
import crypto from 'crypto';
import sendEmail from "../utility/nodemailer";

export const ForgetController = async (req: Request , res: Response) =>{

    const email =req.body.email;

    try{

        const user = await User.findOne({where: {email: email}} )
    
        if(!user) {
            return res.status(404).json({ error: 'User not found' }); }
        
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires as any;
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        const subject = 'Password Reset Request';
       const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

       await sendEmail(email, subject, text);

      res.status(200).json({ message: 'Password reset instructions sent to your email.' });

        
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });

    }


}