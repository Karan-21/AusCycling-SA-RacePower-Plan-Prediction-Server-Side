// NODE OR NPM RELATED IMPORTS
const express = require("express");

// LOCAL IMPORTS
const { checkIfAdmin } = require("../../middlewares/Auth/Auth.middleware");
const getWhitelist = require("./getWhitelist.action");
const addWhitelistUser = require("./addWhitelistUser.action");
const deleteWhitelistUser = require("./deleteWhitelistUser.action");
const editWhitelistUser = require("./editWhitelistUser.action");
const makeUserAdmin = require("./makeUserAdmin.action");

const router = express.Router();

router.get("/admin/whitelist", checkIfAdmin, getWhitelist);
router.post("/admin/whitelist", checkIfAdmin, addWhitelistUser);
router.delete("/admin/whitelist", checkIfAdmin, deleteWhitelistUser);
router.patch("/admin/whitelist", checkIfAdmin, editWhitelistUser);
router.post("/admin/admin", checkIfAdmin, makeUserAdmin);

module.exports = router;
