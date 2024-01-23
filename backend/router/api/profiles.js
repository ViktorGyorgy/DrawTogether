import { Router } from "express";
import cors from 'cors';
import { getStats } from "../../database/profiles.js";

const profilesRouter = new Router();

profilesRouter.get('/:username', async (req, res) =>{
  //send info from database.
  if(res.locals.username != req.params.username){
    return res.sendStatus(400);
  }

  const profile = await getStats(req.params.username);

  if(profile === undefined){
    return res.sendStatus(404);
  }

  res.send(profile);
});

export default profilesRouter;