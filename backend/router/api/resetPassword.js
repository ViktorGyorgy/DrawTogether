import { Router } from "express";
import { getByEmail, updatePassword } from "../../database/users.js";
import { deleteCode, findByCode, insertCode } from "../../database/passwordCodes.js";
import crypto, { randomUUID } from 'crypto';
import sendPasswordReset from "../../mail/mail.js";
import bcrypt from 'bcrypt'

const resetPasswordRouter = new Router();

const saltRounds = 10;

resetPasswordRouter.post('/', async (req, res) => {
    console.log(req.body.email)
    const entry = await getByEmail(req.body.email);
    
    if(!entry){
        return res.status(404).send('No such email in database')
    }

    deleteCode(entry._id);
    const code = randomUUID();
    insertCode(entry._id, code);
    sendPasswordReset(entry._id, entry.email, code);
    

    res.send('Password reset email sent succesfully');
});

resetPasswordRouter.put('/', async (req, res) => {
    console.log(req.body);
    if (req.body.password1 != req.body.password2){
        return res.status(400).send('Passwords don\'t match');
    }

    const entry = await findByCode(req.body.code);
    console.log(entry, req.body.code, entry);
    if (!entry){
        return res.status(400).send('You\'re not allowed to do that!');
    }

    updatePassword(entry._id, await bcrypt.hash(req.body.password1, saltRounds));
    deleteCode(entry._ind);
    res.sendStatus(200);
})

export default resetPasswordRouter;