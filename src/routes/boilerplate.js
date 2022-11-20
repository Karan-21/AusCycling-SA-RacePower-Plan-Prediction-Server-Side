/**
 * @fileoverview Contains boilerplate code for an express route.
 */

// NODE OR NPM RELATED IMPORTS
const express = require("express");

// FIREBASE RELATED IMPORTS
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

/**
 * GET /test - A test route.
 *
 * @returns
 *
 * TODO: Lorem ipsum dolor sit amet, consectetur...
 */
router.get("/test", (req, res) => {
    const snapshot = db.collection("User");
    snapshot
        .get()
        .then(userSnapshot => {
            userSnapshot.forEach(doc => {
                console.log(doc.id, "=>", doc.data());
            });
            res.send("TESTING ROUTES");
        })
        .catch(err => {
            console.log(err);
            res.send("FAILURE");
        });
});

module.exports = router;
