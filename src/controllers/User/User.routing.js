// NODE OR NPM RELATED IMPORTS
const express = require("express");

// LOCAL IMPORTS
const {
    checkIfAuthenticated,
    checkIfAdmin,
} = require("../../middlewares/Auth/Auth.middleware");
const createUser = require("./createUser.action");
const getUsers = require("./getUsers.action");
const getUserById = require("./getUserById.action");
const createUserProfile = require("./createUserProfile.action");
const getRoles = require("./getRoles.action");

const router = express.Router();

router.get("/user", checkIfAdmin, getUsers);
router.get("/user/roles", checkIfAdmin, getRoles);
router.get("/user/:id", checkIfAuthenticated, getUserById);
router.post("/user", checkIfAuthenticated, createUserProfile);
router.post("/signup", createUser);

module.exports = router;
