const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");
const pointSchema = require("./point");

const campgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    point: {
        type: pointSchema,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [
        {
            filename: String,
            url: String
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reviews: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Review"
        }],
        default: []
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    }
})

campgroundSchema.post("findOneAndDelete", async function (campground) {
    await Review.deleteMany({ _id: { $in: campground.reviews } })
})

campgroundSchema.methods.capitalizeTitle=function(){
    const {title}=this
    this.title = title[0].toUpperCase() + title.slice(1)
}

const Campground = mongoose.model("Campground", campgroundSchema)

module.exports = Campground
