/**
 * @fileoverview Contains routes concerned with User CRUD functionality.
 */

// NODE OR NPM RELATED IMPORTS
const express = require("express");

// FIREBASE RELATED IMPORTS
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();
const userService = require("../services/User.service");

/**
 * POST /forgot-password - Resets a users password.
 *
 * @returns
 */
router.post("/forgot-password", (req, res) => {
    // 1. Retrieve userId
    if ("userID" in req.body.userId && "password" in req.body.password) {
        const userId = req.body.userId;
        const password = req.body.password;

        console.log(userId);
        console.log(password);

        // 2. Update password of that userId
        const userRef = db
            .collection("User")
            .doc(userId)
            .update({
                password: password,
            })
            .then(snapshot => {
                res.send("Password updated");
            })
            .catch(err => {
                console.log(err);
                res.send("Error updating password");
            });
    } else {
        res.sendStatus(400);
    }
});

/**
 * POST /register - Creates a new user.
 *
 * @returns
 */
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    const snapshot = await db.collection("Whitelist").get();
    const whitelist = snapshot.docs.map(doc => doc.id);

    if (whitelist.includes(email) === false) {
        res.status(401).send("Email Is Not Whitelisted.");
    } else {
        try {
            const credentials = await userService.addUser(email, password);
            const token = await userService.customToken(credentials.user.uid);

            await db.doc(`users/${credentials.user.uid}`);
            res.status(201).json({ token });
        } catch (err) {
            console.log(err.code);
            switch (err.code) {
                case "auth/email-already-in-use":
                    res.status(400).send("Email Already Exists.");
                    break;
                case "auth/weak-password":
                    res.status(400).send("Weak Password.");
                    break;
                default:
                    res.status(500).send("Unknown Error.");
            }
        }
    }
});

/**
 * POST /login - Authorises a users login details.
 *
 * @returns
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const credentials = await userService.authenticate(email, password);
        const token = await userService.customToken(credentials.user.uid);

        res.status(200).json({ token });
    } catch (err) {
        switch (err.code) {
            case "auth/wrong-password":
                res.status(401).send("Incorrect Password.");
                break;
            case "auth/user-not-found":
                res.status(500).send("User Not Found.");
                break;
            case "auth/too-many-requests":
                res.status(429).send("Too Many Requests. Please Try Again Later.");
                break;
            default:
                res.status(400).send("Bad Request. Please Try Again Later.");
        }
    }
});

/**
 * GET /roles - Returns the available user roles.
 *
 * @returns
 */
router.get("/roles", async (req, res) => {
    try {
        const snapshot = await db.collection("Roles").get();
        const roles = snapshot.docs.map(doc => doc.data());

        res.status(200).send(roles[0]["roles"]);
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
});

// Authorisation Block
router.use(userService.isAuthenticated);

/**
 * GET /get-user/:id - Returns a user given their ID.
 *
 * @returns
 */
router.get("/get-user/:id", async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        res.status(400).json({ error: { code: "no-user-id" } });
        return;
    }

    if (userId !== req.token.uid) {
        res.status(403).json({ error: { code: "unauthorized" } });
    }

    const snapshot = await db.collection("users").doc(userId).get();
    if (!snapshot.exists) {
        res.status(404).json({ error: { code: "user-not-found" } });
        return;
    }
    const user = snapshot.data();

    res.status(200).json({ user: user });
});

module.exports = router;
