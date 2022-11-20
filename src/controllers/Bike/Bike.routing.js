// NODE OR NPM RELATED IMPORTS
const express = require("express");

// LOCAL IMPORTS
const { checkIfAuthenticated } = require("../../middlewares/Auth/Auth.middleware");
const addBike = require("./addBike.action");
const getBikesForUser = require("./getBikesForUser.action");
const getBikeById = require("./getBikeById.action");
const editBike = require("./editBike.action");
const deleteBike = require("./deleteBike.action");

const router = express.Router();

router.get("/bikes/:id", checkIfAuthenticated, getBikesForUser);
router.get("/bike/:id", checkIfAuthenticated, getBikeById);
router.post("/bike/edit/:id", checkIfAuthenticated, editBike);
router.post("/bike", checkIfAuthenticated, addBike);
router.delete("/bike/:id", checkIfAuthenticated, deleteBike);

module.exports = router;
