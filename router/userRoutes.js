const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator')
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('../../model/config.js');
//  const config = require('./config.json');
const multer = require('multer');
const mailFun = require('../utilities/mail')
var app = express();
// const encodeData = require('../utilities/utilityfunctions');
var registraion = require('../models/user');
var registraionFrom = registraion.User;

// Middlewares
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../Images/");
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + file.originalname);
    }
});

const fileFilter =( req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true)
    } else {
      cb(new Error('Can only upload jpg or png files'), false)
    }
}
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    },
    fileFilter
});

/*    >>>>>>>>>>>>>>>>>>>>>>> REGISTRATION  API  FOR SIGNUP  >>>>>>>>>>>>>>>>>>>>>            */
router.post("/registration", upload.array('images', 3), async (req, res) => {
    try {
        let user = await registraionFrom.findOne({ email: req.body.email });
        var emailToValidate = req.body.email;
            const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (emailRegexp.test(emailToValidate)) {
                if (user) {
                    res.send('your are alredy registered this email.......')
                } else {
                    var body = req.body;
                    let password = await bcrypt.hash(req.body.password, 12);
                    var flag = false;
                    let arr = [];
                    let files = Object.keys(req.files);
                    files.forEach(file => {
                        arr.push(req.files[file].path);
                    });
                    // const token = await registraionFrom.generateAuthToken();
                    var data = {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        address: body.address,
                        phone: body.phone,
                        password: password,
                        url: arr
                    }
                    var myData = new registraionFrom(data);
                    await myData.save();
                    res.status(200).json({ message: 'Saved successfully' });
                }
            } else {
                res.status(400).json({ error: 'Provided email is not correct' });
             }
    } catch(e) {
        res.status(500).json({ error: e });
    }
});

/*    >>>>>>>>>>>>>>>>>>>>>>>>>> LOGIN API FOR SIGNIN  >>>>>>>>>>>>> >>>>>>>>>>>>>>>>>>>>>            */

router.post("/login", (req, res) => {
    registraionFrom.findOne({ email: req.body.email }).then((user, err) => {
        if (err) return res.status(401).send('not a registered user')
        if (!user) return res.status(401).send({ msg: 'the email address' + req.body.email + 'is not registered' });
        if (user) {
           var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            console.log(passwordIsValid)
            if (!passwordIsValid) return res.status(401).send('not match password');
            var token = jwt.sign({ id: user._id, email: user.email }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            console.log(token, 'token aa rha h kya????????')
            var sendToken = {
                token: token,
                firstName: user.firstName,
                email: user.email,
                id: user._id,
                status: 200
            }
            console.log(sendToken, 'sendtoken')
            res.status(200).send(sendToken)
        }

    }).catch(err => {
        console.log('error', err)
    })
});


/*  >>>>>>>>>>>>>>>>>>>>>>>>> FORGOT PASSWORD API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

router.post('/forgot', (req, res) => {
    console.log('forgot password api testing>>>>>>');
    registraionFrom.findOne({ 'email': req.body.email }, (err, user) => {
        var Email = req.body.email;
        console.log(req.body.email, 'email')
        console.log(user, err, 'chal rha h bhai.....................')
        if (err) return res.status(401).send('not a valid email id');
        if (!user) return res.status(401).send('your email id is not registered with database..');
        if (user) {
            console.log('user', '//////////////')
            res.send(user.password);
        }
           /* This code generate the otp
        let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        console.log(otp);
        */

        // var token = jwt.sign({ email: user.email }, config.secret, {
        //     expiresIn: 86400 // expires in 24 hours
        // });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chauhan1995sumit@gmail.com',
                pass: 'Sumit@12345'
            }
        });
        // var sendToken = {
        //     token: token,
            // firstName:user.firstName,
            // email:user.email,
            // id:user._id,
            // status:200
        // }

        var mailOptions = {
            from: 'sumitchauan111@gmail.com',
            to: req.body.email,
            text: 'resend email',
            subject: 'Sending Email using Node.js',
            // html: `<p>Click <a href="http://localhost:1111/account/reset-password?token=${token}">sendToken=${token}</a> to reset your password</p>`
            // text: OTP,
            //html: '<p>Click</p> <a href="http://localhost:1111/account/forgot-password?email=${email}" > here</a> '
            // from: 'sumitchauan111@gmail.com',
            // to: req.body.email,
            // subject: 'Sending Email using Node.js',
            // text: otp
            html: `<p>Click <a href="http://localhost:1111/account/reset-password?email=${Email}">sendEmail</a> to reset your password</p>`
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
        registraionFrom.findOneAndUpdate({ 'email': req.body.email }, { $set: { 'time': time } }).then((result) => {
            console.log('update data is', result);
            res.send(result)
        })
    })
});

// TODO: DKFJ;DSAKFDSK

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>> RESET PASSWORD API ....>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

router.post('/reset', (req, res) => {
    console.log('reset password api calling.........');
    registraionFrom.findOne({ 'email': req.body.email }, async (err, user) => {
        if (err) return res.status(401).send('not a valid otp');
        if (!user) return res.status(401).send('not a valid email...');
   
/*
          if(user.otp == req.body.otp){     <....this code generate the otp time and checking and validate the otp...>
        var start_date = moment(user.time, 'YYYY-MM-DD HH:mm:ss'); 
        var timePresent = moment().format('YYYY-MM-DD HH:mm:ss');
        var end_date = moment(timePresent, 'YYYY-MM-DD HH:mm:ss');
        var duration = moment.duration(end_date.diff(start_date));
        var timeDi = duration.asMinutes(); 
        console.log(timeDi,'???');
        var timeDiff = Math.round(timeDi);
*/
        var time = new Date();
        var diff = (time.getTime() - user.time) / 1000;
        console.log(diff);
        let d = diff / 60;
        var timeDiff = Math.round(d);
        console.log(timeDiff);
        if (timeDiff >= 400) {
            res.send('your token is expired....')
        } else {
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                res.send('password not match with confirm password')
            } else {
                let password2 = await bcrypt.hash(req.body.password, 12);
                registraionFrom.findOneAndUpdate({ email: user.email }, { $set: { password: password2 } }).then((result) => {
                    console.log(result);
                    res.send('you are login with new password with rwgistered email.... ')
                })
            }
        }
        //   }
        //   else {
        //       res.send('wrong otp...')
        //   }
    })

})

//<--------------------------change password api for admin panel --------------->

router.post('/changePassword', auth , (req, res) => {
    registraionFrom.findOne({ 'email': req.decoded.email }, async (err, user) => {
        var passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (passwordIsValid) {
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                // res.status(401).send('password not match with confirm password')
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            } else {
                let password2 = await bcrypt.hash(req.body.password, 12);
                registraionFrom.findOneAndUpdate({ email: user.email }, { $set: { password: password2 } }).then((result) => {
                    // res.status(200).send('your password changed..........')
                    // res.status(200).json('you password changed')
                    return res.status(200).send({ status:200 ,auth: true, message: 'you password changed.' });
                })
            }
        } else {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

    });
    
})


/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< UPLOAD IMAGE API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.post("/upload", upload.array('images', 3), async(req, res) => {
    let arr = [];
    let files = Object.keys(req.files);
    files.forEach(file => {
    arr.push(req.files[file].path);
    });
    // let mod = new model();
    var registraionFrom = registraion.User;
    var myData = new registraionFrom(arr);
    // registraionFrom.url = arr;
    await myData.save();
    res.status(200).json({ success: true });








//  var registraionFrom = registraion.User;
//    var imagesData =[{
//        mimetype:req.files[0].mimetype,
//        filename:req.files[0].filename,
//        path : req.files[0].path
//    }]
//    var url = imagesData[0];
//    console.log(url ,'url')
//     console.log(Object.values(url),'url value....')
//    res.status(200).json({imagesData});
//    var myData = new registraionFrom({imagesData});
//    myData.save().then((item)=>{
//        console.log(imagesData,'image')
//    });
   
});


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
});

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
