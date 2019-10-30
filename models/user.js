var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-user1", { useNewUrlParser: true });
const validator = require('validator');
// const Role = require('role/role')
var registrationSchema = new mongoose.Schema({
   
    firstName: {
        type: String,
         required: true, 
        trim: true,

    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email')
            }
        }
    },
    address: {
        type: String
    },
    phone: {
        type: Number,
        required: true 
    },
    password: {
        type: String,
        required: true, 
         min:8,
         max:20
    },
    otp:{ 
        type: String, 
       },
    time: {
        type: Date,
        default: Date.now 
    },
    token: {
        type: String,
        // required: true  
    },
    url: {
        type: Array,
        default: []
    },
    // mailVerified:{
    //     type:Boolean,
    //     default:false
    // },
    authOtpVerified:{
        type:Boolean,
        default:false,
    },
    authTokenVerified :{
        type:Boolean,
        default:true
    },
    role :{
        type:String,
        default :"user"
    },
  
});
    

var loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        // unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
})

var uploadImageSchema = new mongoose.Schema({
    url: {
        type: Array,
        default: []
    },
    // email: {
    //     type: String
    // },
    // firstName: {
    //     type: String
    // }
})

var addBooksSchema = new mongoose.Schema({
    name: {
        type: String
    },
    author: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    images :{
        type:Array,
        default:[]
    },
    code:{
        type:Number
    },
    status:{
        type:String
    }
})


var User = mongoose.model("user", registrationSchema);
var login = mongoose.model("login", loginSchema);
var uploadImage = mongoose.model("uploadImage", uploadImageSchema);
var addBooksSchema = mongoose.model("addBooks", addBooksSchema)



module.exports.User = User;
module.exports.login = login;
module.exports.uploadImage = uploadImage;
module.exports.addBooksSchema = addBooksSchema;
