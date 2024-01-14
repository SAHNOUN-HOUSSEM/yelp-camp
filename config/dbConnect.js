require("dotenv").config();

const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;

module.exports.dbConnect = () => {
  mongoose.connect(DB_URL);

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Database connected");
  });
};
