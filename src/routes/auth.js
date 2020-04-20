import jwt from 'jsonwebtoken';
import config from '../utils/config';

const {tokenSignature} = config;

/**
 * Generate a JWT with user information
 * @param  {Object} user
 * @return {String} jwt
 */
export const generateJWT = (user) => {
  const today = new Date();
  const expDate = new Date(today);

  expDate.setDate(today.getDate() + 14);

  return jwt.sign(
    {
      ...user,
      exp: parseInt(expDate.getTime() / 1000),
    },
    tokenSignature
  );
};

/**
 * Verify JWT
 * @param  {String} token Token to verify
 * @return {Promise} Returns a promise since jwt.verify is async
 */
export const verifyJWT = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, tokenSignature, (err, decoded) => {
      if (err) {
        resolve({valid: false});
      }

      resolve({user: decoded, valid: true});
    });
  });
};

/*
Get JSON Web Token
*/
export const getToken = (req, res) => {
  jwt.sign({id: req.id}, tokenSignature, {expiresIn: 86400}, (error, token) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(token);
    };
  });
};
