if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware");
const session = require("express-session");
const flash = require("connect-flash");
const {
  flashMessagesMiddleware,
  templateVariables,
} = require("./middlewares/globalVariablesMiddleware");
const authenticationRouter = require("./routes/authentication");
const passport = require("passport");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const { helmet } = require("./middlewares/helmet");
const usersRouter = require("./routes/users");
const notificationsRouter = require("./routes/notifications");
const { dbConnect } = require("./config/dbConnect");
const seedDB = require("./seeds");

dbConnect();

seedDB();

const app = express();

app.engine("ejs", engine);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(mongoSanitize());
app.use(helmet);

const sessionConfig = {
  name: "_hesu",
  secret: "çàçéondeù%£°3",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//configure local strategy
// passport.use(new LocalStrategy(User.authenticate()))
passport.use(User.createStrategy());

//serialize user to store in session
passport.serializeUser(User.serializeUser());
//deserialize user from session
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

//Global variables
app.use(flashMessagesMiddleware);
app.use(templateVariables);

app.use("/users", usersRouter);
app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds/:campgroundId/reviews", reviewsRouter);
app.use("/", authenticationRouter);
app.use("/", notificationsRouter);

app.get("/", (req, res) => {
  res.render("home");
});

app.use((req, res) => {
  throw new ExpressError(`Page not found: ${req.method} ${req.path}`, 404);
});

app.use(errorHandlerMiddleware);

app.listen(3030, () => {
  console.log("server running on port 3030");
});
