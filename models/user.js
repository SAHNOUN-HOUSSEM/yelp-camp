const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /^\S+@\S+\.\S+$/,
        trim: true
    },
    phone: {
        type: Number,
        min: 0
    },
    avatar: {
        type: {
            filename: String,
            url: String,
            _id: false
        },
        default:
        {
            filename: null,
            url: "https://res.cloudinary.com/dwxnwtaly/image/upload/f_auto,q_auto/v1/YelpCamp/viv9gq3smmf38d0vktog",
        }
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

userSchema.virtual("fullname")
    .get(function () {
        return `${this.lastname} ${this.firstname}`
    })

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

module.exports = User