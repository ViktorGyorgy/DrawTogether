import { Router, json } from 'express';
import authenticate from '../../middleware/autentication.js';
import loginRouter from './login.js';
import signupRouter from './signup.js';
import resetPasswordRouter from './resetPassword.js';
import signoutRouter from './signout.js';
import profilesRouter from './profiles.js';

const router = Router();
router.use(json());

router.use('/login', loginRouter);
router.use('/signup', signupRouter)
router.use('/reset-password', resetPasswordRouter)

router.use(authenticate)
router.use('/signout', signoutRouter)
router.use('/profiles', profilesRouter)

//TODO: add here user info 

export default router;