const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const getAllIds = require("../utilities/getAllIds");
const User = require("../models/user");
const { faker } = require("@faker-js/faker");
const Address = require("../models/address");

async function seedDB() {
  await addUsers();
  await Campground.deleteMany();
  const descriptorsLength = descriptors.length;
  const placesLength = places.length;
  const citiesLength = cities.length;
  const allUserIDs = await getAllIds(User);
  const usersLength = allUserIDs.length;
  for (let i = 0; i < 100; i++) {
    const city = returnRandomElt(cities, citiesLength);
    const price = Math.floor(Math.random() * 30) + 20;
    const point = {
      type: "Point",
      coordinates: [city.longitude, city.latitude],
    };
    const campgound = new Campground({
      title: `${returnRandomElt(
        descriptors,
        descriptorsLength
      )} ${returnRandomElt(places, placesLength)}`,
      location: `${city.city}, ${city.state}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo asperiores unde qui natus error tempore sint fuga fugiat, repudiandae placeat. Temporibus quis nostrum eos esse eum explicabo vero quidem culpa?lo",
      point,
      price,
      owner: returnRandomElt(allUserIDs, usersLength),
    });
    campgound.images = generateImages();
    await campgound.save();
  }
}

async function addUsers() {
  for (let i = 0; i < 10; i++) {
    const address = new Address({
      country: faker.location.country(),
      state: faker.location.state(),
      town: faker.location.city(),
      zipcode: faker.number.int({ min: 100000 }),
    });
    const user = await User.register(
      new User({
        username: faker.internet.userName(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.number.int({ min: 100000 }),
        avatar: {
          filename: faker.image.avatar(),
          url: faker.image.avatar(),
        },
        address: address,
        isAdmin: returnRandomElt([true, false], 2),
      }),
      "password"
    );
    await address.save();
  }
}

function returnRandomElt(array, arrayLenght) {
  const rand = Math.floor(Math.random() * arrayLenght);
  return array[rand];
}

function generateImages() {
  const images = [];
  const number = Math.ceil(Math.random() * 4);
  for (let i = 0; i < number; i++) {
    const newImage = {
      url: faker.image.urlLoremFlickr({ category: "nature" }),
      filename: "image",
    };
    images.push(newImage);
  }
  return images;
}

module.exports = async () => {
  if ((await Campground.count()) !== 0) {
    return;
  }
  seedDB()
    .then(() => {
      console.log("campgrounds created");
    })
    .then(() => {
      console.log("Disconnected from MongoDB");
    })
    .catch((err) => {
      console.error("Failed to disconnect from MongoDB:", err);
    });
};
