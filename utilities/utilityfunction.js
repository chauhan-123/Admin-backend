// const bcrypt = require('bcrypt');

// const saltRounds = 5;

// function encryptPass(pass) {
//      // console.log('------------------',pass)
//      return new Promise((resolve, reject) => {
//           bcrypt.genSalt(saltRounds, function (err, salt) {
//                bcrypt.hash(pass, salt, function (err, hash) {
//                     if (err) {
//                          // console.log(err)
//                          resolve(false)
//                          return
//                     }
//                     // console.log(hash)
//                     resolve(hash)
//                });
//           });
//      })
// }
// module.exports = {
//      encryptPass
// }

