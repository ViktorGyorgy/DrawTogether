import { Router } from "express";
import { getHashedPasswordOfUser } from "../../database/users.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from "../../configuration/secret.js";


const loginRouter = Router();

const saltRounds = 10;

loginRouter.post('/', async (req, res) => {
  let hashedPassword = '';
    try{
      hashedPassword = await getHashedPasswordOfUser(req.body.username);
    }
    catch(err){
      return res.status(400).send("User or password is not right");
    }
    if (!(await bcrypt.compare(req.body.password, hashedPassword))) {
      return res.sendStatus(400);
    }
    
    const token = jwt.sign({ username: req.body.username }, secret);
    res.cookie('JwtToken', token, {sameSite: 'strict' }).sendStatus(200);
});

loginRouter.get('/', async (req, res) => { 
  jwt.verify(req.cookies.JwtToken, secret, (err, decoded) => {
    if (err) {
      res.status(400);
    }
    else{
      res.sendStatus(200)
    }
  });
})

export default loginRouter;