const mongoose = require("mongoose")
const User = require("./user")
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})

const Review = mongoose.model("Review", reviewSchema)

module.exports=Review