const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator')
var bodyParser = require('body-parser');
 const auth = require('../middleware/auth');
 const jwt = require('jsonwebtoken');
 const config = require('../../model/config');
//  const config = require('./config.json');
// const multer = require('multer');
var cors = require('cors');
const mailFun = require('../utilities/mail')
var app = express();
// const encodeData = require('../utilities/utilityfunctions');
var registraion = require('../models/user');
var registraionFrom = registraion.User;
var loginFrom = registraion.login;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const photo = multer({
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('please upload only image'))
//         }
//         cb(undefined, true)
//     }
// })



/*     REGISTRATION  API >>>>>>>>>>>>>>>>>>>>>            */
router.post("/registration", (req, res) => {
    console.log("Testing addname");
    registraionFrom.findOne({ email: req.body.email }, async (err, user) => {
        var emailToValidate = req.body.email;
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (emailRegexp.test(emailToValidate)) {
            if (err) return res.status(401).send('something went wrong......');
            console.log(">>>>>>>>>")
            if (user) return res.send('your are alredy registered this email.......')
            else {
                var body = req.body;
                let password = await bcrypt.hash(req.body.password, 12);
             
                // const token = await registraionFrom.generateAuthToken();
                var data = {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email,
                    address: body.address,
                    phone: body.phone,
                    password: password,
                    //  token : token
                }
                console.log("data", data);
                var myData = new registraionFrom(data);
                myData.save().then(item => {
                    console.log("new user ?????")
                    res.send('item saved to the database')
                })
                    .catch(err => {
                        res.status(400).send('unable send to the data');
                    });
            }
        }
        else {
            console.log("You have entered an invalid email address!");
            res.send('wrong email??????????????')
        }
    })
});


/*     LOGIN API >>>>>>>>>>>>>>>>>>>>>            */

router.get("/login", (req, res) => {
    console.log("Testing login api");
    registraionFrom.findOne({ email: req.body.email }, async (err, user) => {
        if (err) return res.status(401).send('not a regisyered user')
        if (!user) return res.status(401).send({ msg: 'the email address' + req.body.email + 'is not registered' });
        if (user) {
            console.log('email id registered')
            // let password = await bcrypt.hash(req.body.password, 12)
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            console.log(passwordIsValid)
            if (!passwordIsValid) return res.status(401).send('not match password');
            var token = jwt.sign({ id: user._id , email: this.user.email}, config.secret, {
                expiresIn: 86400 // expires in 24 hours
              });
            res.send('your password  is matched with registered email.......', token)
      
        }
    
    });
});


/*   FORGOT PASSWORD API */
router.post('/forgot', (req, res) => {
    console.log('forgot password api testing>>>>>>');
    registraionFrom.findOne({ 'email': req.body.email }, (err, user) => {
        if (err) return res.status(401).send('not a valid email id');
        if (!user) return res.status(401).send('your email id is not registered with database..');
        if (user) {
            console.log('user', '//////////////')
            res.send(user.password);
        }

        let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        console.log(otp);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sumitchauan111@gmail.com',
                pass: 'Sumit34977001524'
            }
        });

        var mailOptions = {
            from: 'sumitchauan111@gmail.com',
            to: req.body.email,
            subject: 'Sending Email using Node.js',
            text: otp
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // var today = new Date();
        // var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        // var dateTime = time;

        // const now = new Date();
        // console.log(now);
        // const minute = now.getTime();
        // const time = minute/1000;
         // 1 hour
        // const minute = now.getMilliseconds();
        // console.log(minute);

        // var time = moment().format('YYYY-MM-DD HH:mm:ss');

       var time = new Date();


        registraionFrom.findOneAndUpdate({ 'email': req.body.email }, { $set: { 'otp': otp, 'time': time } }).then((result) => {
            console.log('update data is', result);
            res.send(result)
        })
    })
})

  /*  RESET PASSWORD API .... */
   router.post('/reset',(req,res)=>{
    console.log('reset password api calling.........');
    registraionFrom.findOne({'email':req.body.email},(err,user)=>{
        if(err) return res.status(401).send('not a valid otp');
        if(!user) return res.status(401).send('not a valid email...');
        console.log(user,'111111');
          if(user.otp == req.body.otp){
            // var start_date = moment(user.time, 'YYYY-MM-DD HH:mm:ss');
            // var timePresent = moment().format('YYYY-MM-DD HH:mm:ss');
            // var end_date = moment(timePresent, 'YYYY-MM-DD HH:mm:ss');
            // var duration = moment.duration(end_date.diff(start_date));
            // var timeDi = duration.asMinutes(); 
            // console.log(timeDi,'???');
            // var timeDiff = Math.round(timeDi);

            var time = new Date();
            var diff =(time.getTime() - user.time) / 1000;
            console.log(diff);
            let d = diff/60;
            var timeDiff = Math.round(d);
            console.log(timeDiff);
             if(timeDiff>=15){
              res.send('your token is expired....')
            } else  {  
                 var password = req.body.password;
                 var confirmPassword = req.body.confirmPassword;
                 if(password !== confirmPassword){
                     res.send('password not match with confirm password')
                 } else{
                     registraionFrom.findOneAndUpdate({email:req.body.email}, {$set:{password:password}}).then((result)=>{
                         console.log(result);
                         res.send('you are login with new password with rwgistered email.... ')
                     })
                 }
                }
   
         
          }
          else {
              res.send('wrong otp...')
          }
    })

   })



// app.post("/addName", (req, res) => {
//     console.log("Testing addname");
//     var myData = new User(req.body);
//     myData.save().then(item => {
//         res.send('item saved to the database')
//     })
//         .catch(err => {
//             res.status(400).send('unable send to the data');
//         });
// });

app.get("/getName", (req, res) => {
    console.log("new data get from data base");
    var userName = req.body.name;
    User.findOne({ 'firstName': userName }).then((result) => {
        console.log('the result is ', result);
        res.send(result);
    })
})

app.put("/updateName", (req, res) => {
    console.log("update query run>>>>>>>>");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var name = req.body.name;
    User.findOneAndUpdate({ 'firstName': firstName }, { $set: { 'lastName': lastName, 'firstName': name } },
        { new: true }).then((result) => {
            console.log('update data is', result);
            res.send(result)
        })

})


app.delete("/deleteName", (req, res) => {
    console.log("data deleted from database");
    var firstName = req.body.firstName;
    User.remove({ 'firstName': firstName }).then((result) => {
        console.log('delete data is ', result);
        res.send(result)
    })
})


module.exports = router



// app.listen(port, () => {
//     console.log("server listen to the port " + port);

// });

// router.post('/register', async (req, res) => {

//     const user = new User(req.body)
//     // console.log('users-=-=-=-=-=-=-=-=>', user)
//     try {
//         let hash = await encodeData.encryptPass(user._id.toString());
//         user.mailHash = hash;
//         let mailsent = await sendMailAfterRegistration(user, hash)
//         await user.save();
//         res.status(201).send({
//             error: false,
//             msg: 'User registered successfully'
//         })
//     } catch (error) {
//         res.status(400).send(error)
//     }
// });

// async function sendMailAfterRegistration(user, hash) {
//     link = `http://localhost:3002/verify/${user.workemail}?code=${hash}`
//     mailContent = `<h2>Good to see you ${user.firstName} ${user.SurName}</h2>
//     <p>click on the link below to verify mail ${user.workemail}</p>
//     <a href=${link}>VERIFY</a>`
//     return mailFun(user.workemail, 'Verify mail', mailContent)
// }

// //--------LogIn--------------
// router.post('/user/login', async (req, res) => {
//     console.log('---------', req.body)
//     try {
//         var user = await User.findOne({
//             workemail: req.body.email
//         });

//         if (!user) {
//             res.json({
//                 error: true,
//                 msg: 'Invalid credentials'
//             })
//         }

//         if (!user.mailVerified) {
//             res.json({
//                 error: true,
//                 msg: 'Please verify your mail ' + user.email
//             })
//         }
//         var ans = await bcrypt.compare(req.body.password, user.password);
//         // console.log('---------->', ans)
//         const token = await user.generateAuthToken()
//         // console.log("xyz", user);
//         let userData = {
//             firstName: user.firstName,
//             Nickname: user.Nickname,
//             SurName: user.SurName,
//             companyName: user.companyName,
//             workemail: user.workemail,
//             token: user.tokens[0].token
//         }
//         if (ans) {
//             res.json({
//                 error: false,
//                 msg: 'login successfull',
//                 data: userData
//             })
//         } else {
//             res.json({
//                 error: true,
//                 msg: 'invalid credentials',
//             })
//         }

//     } catch (error) {

//     }
// })

// router.get('/verify/:email', async (req, res) => {
//     var user = await User.findOne({
//         workemail: req.params.email
//     })
//     if (user.mailHash == req.query.code) {
//         user.mailVerified = true;
//         await User.findOneAndUpdate({email:user.workemail},{$set:{mailVerified:true}})
//         res.json({
//             error: false,
//             msg: 'mail verified successfully'
//         })
//     } else {
//         res.json({
//             error: true,
//             msg: 'mail not verified'
//         })
//     }
// })
