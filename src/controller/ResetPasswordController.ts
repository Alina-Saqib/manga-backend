import { Request, Response } from "express";
import User from "../model/userSchema";
import bcrypt from "bcryptjs";

const ResetPasswordController = async (req: Request, res: Response) => {
    const token = req.params.token;
    const { password } = req.body;

  try {
    const user = await User.findOne({
        where: {
            resetPasswordToken: token,
        },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

   
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ error: 'The reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default ResetPasswordController;
