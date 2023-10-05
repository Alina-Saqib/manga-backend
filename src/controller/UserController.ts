import { Request, Response } from 'express';
import User from '../model/userSchema';
import bcrypt from 'bcryptjs';


export const deleteUser = async(req: Request, res: Response) =>{
 const UserId =req.params.id;

 const user = await User.findByPk(UserId);
 if (!user){
    return res.status(404).json({ error: 'User not found' });
 }

 try{

 await user.destroy();
 res.status(200).json({ message: 'User deleted successfully' });}
 catch(error){
    res.status(500).json({ error: 'Internal server error' });
 }

}


export const updateUser = async (req: Request, res: Response)=>{
    const UserId = req.params.id;
    const { name, email, password, display_name } = req.body;

    const user = await User.findByPk(UserId);
 if (!user){
    return res.status(404).json({ error: 'User not found' });
 }

 try{


 if (name) {
    user.name = name;
  }
  if (email) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email  already exists' });
    }
    user.email = email;
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword; 
  }
  if (display_name) {
    const existingUser = await User.findOne({ where: { display_name} });

    if (existingUser) {
      return res.status(400).json({ message: 'Display_name already exists' });
    }
    user.display_name = display_name;
  }

  await user.save();

  res.status(200).json({ message: 'User updated successfully' });}catch(error){
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });

  }


} 