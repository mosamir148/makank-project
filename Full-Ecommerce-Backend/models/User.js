const moongose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

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
    address:{
        type:String,
    },
    image:{
        type:String,
    },
    role:{
        type:String,
        enum: ["user", "admin"], 
        default: "user" 
    },
    publicId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values for existing users
        default: function() {
            return uuidv4();
        }
    },
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
},
    {timestamps:true}
)

// Pre-save hook to ensure publicId is always set (for existing users without publicId)
UserSchema.pre('save', function(next) {
    if (!this.publicId) {
        this.publicId = uuidv4();
    }
    next();
});

module.exports = moongose.model("User",UserSchema)
