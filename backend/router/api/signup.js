import { Router } from "express";
import express from "express";
import { saveUser } from "../../database/users.js";
import bcrypt from 'bcrypt';
import { initalizeForUser } from "../../database/profiles.js";

const signupRouter = Router();
signupRouter.use(express.json());

const saltRounds = 10;

signupRouter.post('/', async (req, res) => {
    try{
        await saveUser(req.body.username, await bcrypt.hash(req.body.password, saltRounds), req.body.email);
        await initalizeForUser(req.body.username);
    }
    catch (err){
        return res.status(400).send("Username is taken");
    }
    //TODO: add validation
    res.sendStatus(200);
});

export default signupRouter;