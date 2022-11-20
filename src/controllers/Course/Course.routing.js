// NODE OR NPM RELATED IMPORTS
const express = require("express");

// LOCAL IMPORTS
const { checkIfAuthenticated } = require("../../middlewares/Auth/Auth.middleware");
const getCourses = require("./getCourses.action");
const addCourse = require("./addCourse.action");
const uploadCourse = require("./uploadCourse.action");
const getTerrainTypes = require("./getTerrainTypes.action");

const router = express.Router();

router.get("/courses", checkIfAuthenticated, getCourses);
router.post("/course", checkIfAuthenticated, addCourse);
router.post("/uploadCourse", checkIfAuthenticated, uploadCourse);
router.get("/course/terrain", checkIfAuthenticated, getTerrainTypes);

module.exports = router;
