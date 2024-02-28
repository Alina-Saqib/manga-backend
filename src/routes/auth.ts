import express, { Router, Response,Request } from 'express';
import { check } from 'express-validator';
import dotenv from 'dotenv';
import RegisterController from '../controller/RegisterController';
import LoginController from '../controller/LoginController';
import { deleteUser, updateUser } from '../controller/UserController';
import { ForgetController } from '../controller/ForgetController';
import ResetPasswordController from '../controller/ResetPasswordController';



dotenv.config();
const router: Router = express.Router();


router.post(
  '/register',
  [
    check('name', 'name is required').notEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('display_name', 'Display Name is required').notEmpty(),
  ],
  RegisterController
 
);

router.post(
    '/login',
    [
      check('email', 'Email is required').isEmail(),
      check('password', 'Password is required').notEmpty(),
    ],

    LoginController

);


router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

router.post('/forget-password' , ForgetController)

router.post('/reset-password/:token' , ResetPasswordController)

  


export default router;
