var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-demo");

var registrationSchema = new mongoose.Schema({
    firstName:String,
    lastName: String,
    email:String,
    address:String,
    phone:Number,
    password:String,
    otp:String,
    time:Object

});

var User = mongoose.model("user",registrationSchema);

var loginSchema = new mongoose.Schema({
    email:String,
    password:String
})

var login = mongoose.model("login",loginSchema);

// create jwt
registrationSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'somesecretkey')
    user.tokens = user.tokens.concat({token})
    return token
}

module.exports.User = User;
module.exports.login= login;