const mongoose = require("mongoose")
const User = require("./user")
const Campground = require("./campground")

const { Schema } = mongoose

const notificationSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Notification = mongoose.model("Notification", notificationSchema)

module.exports = Notification