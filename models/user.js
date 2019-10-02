var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-user1", { useNewUrlParser: true });

var registrationSchema = new mongoose.Schema({
    firstName:{ type: String, required: true },
    lastName: { type: String, required: true },
    email:{ type: String, required: true },
    address:{ type: String, required: true },
    phone:{ type: Number , required: true },
    password:{ type: String, required: true },
    otp:{ type: String, required: true },
    time: { type: String, default: Date.now },
    token:{ type: String, required: true },
    url:{ type: Array, default: [] }
});

// const registrationSchema = new Schema({
//     firstName: {
//       type: 'String',
//       required: true,
//       trim: true,
//       unique: true
//     },
//     email: {
//         type: 'String',
//         required: true,
//         trim: true,
//         unique: true
//       },
//       phone: {
//         type: 'Number',
//         required: true
//       },
//       address: {
//         type: 'String'
//       },
//     password: {
//       type: 'String',
//       required: true,
//       trim: true
//     }
//   });

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