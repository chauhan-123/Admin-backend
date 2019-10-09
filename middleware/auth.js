const jwt = require('jsonwebtoken')
// const User = require('../models/user')
const config = require('../../model/config');

let auth = (req, res, next) => {
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase
  console
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, config.secret , (err, decoded) => {
      if (err) {
        console.log(err, ' error');
        return res.json({ error: 'Token is not valid', success: false });
      } else {
        req.decoded = decoded;
        // console.log(req.decoded[1],'PPPPPPPPPPPP')
        next();
      }
    });
  } else {
    return res.json({ success: true, error: 'Auth token is not supplied' });
  }
};





module.exports = auth