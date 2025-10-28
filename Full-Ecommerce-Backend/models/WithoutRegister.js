const mongoose = require("mongoose");

const WithOutSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
    },
    phoneWhats: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Complete", "Failed"],
        default: "Pending",
    },
    
}, { timestamps: true });

module.exports = mongoose.model("WithoutRegister", WithOutSchema);
