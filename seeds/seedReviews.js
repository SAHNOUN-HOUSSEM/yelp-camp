const mongoose = require("mongoose")
const { faker } = require('@faker-js/faker');
const Campground = require("../models/campground");
const getAllIds = require("../utilities/getAllIds");
const User = require("../models/user");
const Review = require("../models/review");


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

addReviews()
    .then(() => {
        console.log("campgrounds created")
        return mongoose.connection.close()
    })
    .then(() => {
        console.log('Disconnected from MongoDB');
    })
    .catch((err) => {
        console.error('Failed to disconnect from MongoDB:', err);
    });


async function addReviews () {
    const campground = await Campground.findOne()
    const allUsers = await getAllIds(User)
    const userCount = allUsers.length
    for (let i = 0; i < 30; i++) {
        const reviewText = faker.lorem.paragraph({ min: 5, max: 10 })
        const reviewRating = Math.ceil(Math.random() * 5)
        const reviewOwner = returnRandomElt(allUsers , userCount)
        const review = new Review({
            text: reviewText,
            rating: reviewRating,
            owner: reviewOwner
        })
        await review.save()
        campground.reviews.push(review)
    }
    await campground.save()
}




function returnRandomElt(array, arrayLenght) {
    const rand = Math.floor(Math.random() * arrayLenght)
    return array[rand]
}