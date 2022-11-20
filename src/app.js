// NODE OR NPM RELATED IMPORTS
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const logger = require("morgan");

// Creating the Express APP and Initialising the PORT
const app = express();
const PORT = 4000;

// Express Configuration
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000"],
    })
);
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Creating an Express Session
app.use(
    session({
        secret: "vuwrbgiubfson",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// Route Files
const routePrefix = "/api";

const usersRouter = require("./controllers/User/User.routing");
app.use(routePrefix, usersRouter);

const bikeRouter = require("./controllers/Bike/Bike.routing");
app.use(routePrefix, bikeRouter);

const coursesRouter = require("./controllers/Course/Course.routing");
app.use(routePrefix, coursesRouter);

const adminRouter = require("./controllers/Admin/Admin.routing");
app.use(routePrefix, adminRouter);

app.listen(PORT, () => console.log(`Server is ON 🚀 http://localhost:${PORT}`));
