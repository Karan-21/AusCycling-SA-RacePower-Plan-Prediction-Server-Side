/**
 * @fileoverview Contains routes concerned with Admin CRUD functionality.
 */

// NODE OR NPM RELATED IMPORTS
const express = require("express");

// FIREBASE RELATED IMPORTS
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

/**
 * GET /whitelist - Fetches all emails on the whitelist.
 *
 * @return
 */
router.get("/whitelist", async (req, res) => {
    try {
        const snapshot = await db.collection("Whitelist").get();
        const whitelist = snapshot.docs.map(doc => doc.data());

        res.status(200).send(whitelist);
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
});

/**
 * POST /whitelist-add - Adds a given email address to the whitelist.
 *
 * @returns
 *
 * TODO: Add admin permissions.
 */
router.post("/whitelist-add", async (req, res) => {
    const { email, role } = req.body;

    try {
        await db.collection("Whitelist").add({ email: email, role: role });

        res.status(200).send("Successfully Added Email to Whitelist.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
});

module.exports = router;
