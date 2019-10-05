var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-user1", { useNewUrlParser: true });

var registrationSchema = new mongoose.Schema({
    firstName:{
         type: String, 
         required: true, 
         trim : true 
        },
    email:{
        type: String, 
        required: true,
        trim:true,
        unique:true
        },
    address:{ 
        type: String
     },
    phone:{ 
        type: Number , 
        required: true 
    },
    password:{ 
        type: String, 
        required: true 
    },
    // otp:{ 
    //     type: String, 
    //    },
    time: { 
        type: String, 
        default: Date.now 
    },
    token:{ 
        type: String, 
        // required: true 
    }

});

var loginSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        trim:true,
        // unique: true
    },
    password:{
        type:String,
        required:true,
        trim:true
    }
})

var uploadImageSchema =  new mongoose.Schema({
    url:{ 
        type: Array, 
        default: [] 
    },
    email:{
        type:String
    }
}) 


var User = mongoose.model("user",registrationSchema);
var login = mongoose.model("login",loginSchema);
var uploadImage = mongoose.model("uploadImage",uploadImageSchema)



module.exports.User = User;
module.exports.login= login;
module.exports.uploadImage = uploadImage;
