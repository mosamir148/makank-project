const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    category: {
        type: String,
        required: true, 
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    brand:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    discount: {
        type: Number, 
        default: 0,
    },
    image:{
        type:String ,
        required:true,
    },
    images:[{  
        type:String
    }]
},
    { timestamps: true }
)

module.exports = mongoose.model("Product",ProductSchema)