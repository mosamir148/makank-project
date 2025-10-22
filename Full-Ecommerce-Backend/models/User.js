const moongose = require("mongoose")

const UserSchema = new moongose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    role:{
        type:String,
        enum: ["user", "admin"], 
        default: "admin" 
    },
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
},
    {timestamps:true}
)

module.exports = moongose.model("User",UserSchema)
