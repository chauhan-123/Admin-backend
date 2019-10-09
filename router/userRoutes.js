const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator')
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('../../model/config.js');
const multer = require('multer');
const mailFun = require('../utilities/mail')
const path = require('path');
var app = express();
// const encodeData = require('../utilities/utilityfunctions');
var registraion = require('../models/user');
var registraionFrom = registraion.User;
var uploadImage = registraion.uploadImage;
var addBooksSchema = registraion.addBooksSchema;

// Middlewares
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../Images/");
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
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
router.post("/registration", async (req, res) => {
    try {
        let user = await registraionFrom.findOne({ email: req.body.email });
        var emailToValidate = req.body.email;
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (emailRegexp.test(emailToValidate)) {
            if (user) {
                res.status(200).json({ message: 'your are alredy registered this email.......' })
            } else {
                var body = req.body;
                let password = await bcrypt.hash(req.body.password, 12);
                var flag = false;
                // let arr = [];
                // let files = Object.keys(req.files);
                // files.forEach(file => {
                //     arr.push(req.files[file].path);
                // });
                // const token = await registraionFrom.generateAuthToken();
                var data = {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email,
                    address: body.address,
                    phone: body.phone,
                    password: password,
                    // url: arr
                }
                var myData = new registraionFrom(data);
                await myData.save();
                res.status(200).json({ message: 'Saved successfully' });
            }
        } else {
            res.status(400).json({ error: 'Provided email is not correct' });
        }
    } catch (e) {
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
            if (!passwordIsValid) res.status(401).json({ message: 'not match password' });
            var token = jwt.sign({ id: user._id, email: user.email , firstName : user.firstName }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            var sendToken = {
                token: token,
                firstName: user.firstName,
                email: user.email,
                id: user._id,
                status: 200
            }
            res.status(200).send(sendToken)
        }

    }).catch(err => {
        console.log('error', err)
    })
});


/*  >>>>>>>>>>>>>>>>>>>>>>>>> FORGOT PASSWORD API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

router.post('/forgot', (req, res) => {
    registraionFrom.findOne({ 'email': req.body.email }, (err, user) => {
        var Email = req.body.email;
        if (err) res.status(401).json({ message: 'not a valid email id' });
        if (!user) res.status(401).json({ message: 'your email id is not registered with database..' });
        if (user) {
            res.status(200).json({ password: user.password });
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
            res.status(200).json({ Result: result });
        })
    })
});



/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>> RESET PASSWORD API ....>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

router.post('/reset', (req, res) => {
    registraionFrom.findOne({ 'email': req.body.email }, async (err, user) => {
        if (err) res.status(401).json({ message: 'not a valid otp' });
        if (!user) res.status(401).json({ message: 'not a valid email...' });

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
        let d = diff / 60;
        var timeDiff = Math.round(d);
        if (timeDiff >= 400) {
            res.status(500).json({ message: 'your token is expired....' })
        } else {
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                res.status(400).json({ message: 'password not match with confirm password' });
            } else {
                let password2 = await bcrypt.hash(req.body.password, 12);
                registraionFrom.findOneAndUpdate({ email: user.email }, { $set: { password: password2 } }).then((result) => {
                    res.status(200).json({ message: 'you are login with new password with registered email.... ' })
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

router.post('/changePassword', auth, (req, res) => {
    registraionFrom.findOne({ 'email': req.decoded.email }, async (err, user) => {
        var passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);
        if (passwordIsValid) {
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            } else {
                let password2 = await bcrypt.hash(req.body.password, 12);
                registraionFrom.findOneAndUpdate({ email: user.email }, { $set: { password: password2 } }).then((result) => {
                    return res.status(200).send({ status: 200, auth: true, message: 'you password changed.' });
                })
            }
        } else {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

    });
})

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ADMIN DETAILS API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.get('/admin_details',auth,(req,res)=>{
    console.log(req.decoded.email,'::::::::::');
    try{
        registraionFrom.findOne({ email: req.decoded.email }).then((user, err) => {
             res.status(200).json({ message: 'data successfully get from database', data : user , status : 200 })
         })

    }catch (e) {
        res.status(500).json({ error: e });
    }
})





/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< UPLOAD IMAGE API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
const fs = require('fs');
router.post("/upload", upload.array('images', 1), auth, (req, res) => {
    // router.post("/upload", upload.array('images',1), auth , (req,res)=>{
    // var mimetype = req.files[0].mimetype;
    try {
        let arr = [];
        let files = Object.keys(req.files);
        files.forEach(file => {
            arr.push(req.files[file].path);
        });

        var data = {
            url: arr,
            // email: req.decoded.email,
            // firstName : req.decoded.firstName
        }

        let filesToSend = arr.map(item => {
            return fs.readFileSync(path.resolve(path.join(__dirname, '../', item)), 'base64');
        });
     
        //  var myData = new uploadImage(data);
        // await myData.save();
        // var myData = new registraionFrom(data);
        registraionFrom.findOneAndUpdate({ 'email': req.decoded.email }, { $set: { 'url': filesToSend } }).then((result) => {
            // res.status(200).json({ Result: result });
            // let filesToSend = arr.map(item => {
            //     return fs.readFileSync(path.resolve(path.join(__dirname, '../', item)), 'base64');
            // });
            res.status(200).json({ files: filesToSend});
        })
        // let filesToSend = arr.map(item => {
        //     return fs.readFileSync(path.resolve(path.join(__dirname, '../', item)), 'base64');
        // });
        / res.status(200).json({ files: filesToSend});
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

/* <<<<<<<<<<<<<<<<<<<<<<< EDIT PROFILE  API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.put("/edit_profile",  auth, (req, res) => {
console.log(req.body,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

    try {
        var firstName = req.body.firstName;
        var images = req.body.images;
        registraionFrom.findOneAndUpdate({ 'email': req.decoded.email }, { $set: { 'firstName': firstName, 'url': images } },
            { new: true }).then((result) => {
                console.log(result,'result')
                let arr = [];
                let files = Object.keys(req.files);
                files.forEach(file => {
                    arr.push(req.files[file].path);
                });
                let filesToSend = arr.map(item => {
                    return fs.readFileSync(path.resolve(path.join(__dirname, '../', item)), 'base64');
                });
                res.status(200).json({ files: filesToSend, Result : result});

                // res.status(200).json({ message: 'Saved successfully', result: result ,statusCode: 200 });
            })
    } catch (e) {
        res.status(500).json({ error: e });
    }
})

/* <<<<<<<<<<<<<<<<<<<<<<< ADD BOOK  API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.post("/add_book", async (req, res) => {
    try {
        let data = {
            book: req.body.book,
            price: req.body.price,
            description: req.body.description,
            author: req.body.author
        }
        var myData = new addBooksSchema(data);
        await myData.save();
        res.status(200).json({ message: 'Saved successfully', data: myData });
    } catch (e) {
        res.status(500).json({ error: e });
    }
})

/* <<<<<<<<<<<<<<<<<<<<<<< UPDATE BOOK  API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

// router.put("/update_book", (req, res) => {
//     try {
//         var book = req.body.book;
//         var author = req.body.author;
//         var price = req.body.price;
//         var description = req.body.description;

//         addBooksSchema.findOneAndUpdate({ '_id': req.body._id }, { $set: { 'book': book, 'price': price, 'description': description, 'author': author } },
//             { new: true }).then((result) => {
//                 res.status(200).json({ message: 'Saved successfully', result: result });
//             })
//     } catch (e) {
//         res.status(500).json({ error: e });
//     }
// })

/* <<<<<<<<<<<<<<<<<<<<<<< DELETE  BOOK  API FOR ADMIN PANEL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

// router.delete("/delete_book", (req, res) => {
//     try {
//         var _id = req.body._id;
//         addBooksSchema.remove({ '_id': _id }).then((result) => {
//             res.status(200).json({ message: 'deleted succesfully ', result: result });
//         })
//     } catch (e) {
//         res.status(500).json({ error: e });
//     }


// })




app.get("/getName", (req, res) => {
    var userName = req.body.name;
    User.findOne({ 'firstName': userName }).then((result) => {
        res.send(result);
    })
});

app.put("/updateName", (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var name = req.body.name;
    User.findOneAndUpdate({ 'firstName': firstName }, { $set: { 'lastName': lastName, 'firstName': name } },
        { new: true }).then((result) => {
            res.send('result')
        })

})


app.delete("/deleteName", (req, res) => {
    var firstName = req.body.firstName;
    User.remove({ 'firstName': firstName }).then((result) => {
        res.send(result)
    })
})


module.exports = router





