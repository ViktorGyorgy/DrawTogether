import jwt from 'jsonwebtoken';
import secret from '../configuration/secret.js';

function authenticate(req, res, next) {
  jwt.verify(req.cookies.JwtToken, secret, (err, decoded) => {
    if (err) {
      res.status(400);
    }
    else{
      res.locals.username = decoded.username;
      next()
    }
  });
}

export default authenticate;
