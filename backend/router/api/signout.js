import { Router } from "express";

const signoutRouter = Router();

signoutRouter.post('/', (req, res) => {
    res.clearCookie('JwtToken');
    console.log("SOMEBODY SIGNS OUT")
    res.sendStatus(200)
})

export default signoutRouter;