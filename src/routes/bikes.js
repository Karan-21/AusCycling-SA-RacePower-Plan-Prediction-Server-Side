/**
 * @fileoverview Contains routes concerned with Bike CRUD functionality.
 */

// NODE OR NPM RELATED IMPORTS
const express = require("express");

// FIREBASE RELATED IMPORTS
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

// Authorisation Block
router.use(function (req, res, next) {
    if ("user" in req.session) {
        console.log("User logged in.");
        next();
    } else {
        console.log("User not logged in.");
        res.send("User not logged in.");
    }
});

/**
 * POST /add-bike - Creates a bike for a user.
 *
 * @returns
 */
router.post("/add-bike", function (req, res) {
    let bike = req.body;

    if (
        "coefficient_rolling_resistance" in bike &&
        "mass" in bike &&
        "mechanical_efficiency" in bike &&
        "mol_whl_front" in bike &&
        "mol_whl_rear" in bike &&
        "name" in bike &&
        "wheel_radius" in bike
    ) {
        let dbBike = db.collection("Bike");
        let user_id = req.session.user["_ref"]["_path"]["segments"][1];
        let query = dbBike
            .where("name", "==", bike.name)
            .where("user_id", "==", user_id)
            .get(); // If bike exists for that user.
        let bikeData;

        query
            .then(bikeSnapshot => {
                bikeSnapshot.forEach(doc => {
                    bikeData = doc;
                });
                // No user found, so create one.
                if (bikeData == null) {
                    let crr = bike.coefficient_rolling_resistance;
                    let mass = bike.mass;
                    let me = bike.mechanical_efficiency;
                    let mwf = bike.mol_whl_front;
                    let mwr = bike.mol_whl_rear;
                    let name = bike.name; //unique
                    let wr = bike.wheel_radius;
                    let time = Date.now();

                    const data = {
                        coefficient_rolling_resistance: crr,
                        mass: mass,
                        mechanical_efficiency: me,
                        mol_whl_front: mwf,
                        mol_whl_rear: mwr,
                        name: name,
                        wheel_radius: wr,
                        created: time,
                        user_id: user_id,
                    };
                    dbBike.add(data);
                    res.send("Added Bike");
                } else {
                    res.send("Bike already exists");
                }
            })
            .catch(err => {
                console.log(err);
                res.send("Something is wrong");
            });
    } else {
        res.send("Wrong Request");
        res.sendStatus(400);
    }
});

/**
 * GET /all-bikes - Fetches all bikes.
 *
 * @returns
 *
 * TODO: Better auth required here.
 */
router.get("/all-bikes", (req, res) => {
    let snapshot = db.collection("Bike");

    snapshot
        .get()
        .then(bikeSnapshot => {
            bikeSnapshot.forEach(doc => {
                console.log(doc.id, "=>", doc.data());
            });
            res.send("Bikes");
        })
        .catch(err => {
            console.log(err);
        });
});

/**
 * GET /get-bike/:id - Fetches a singular bike given its ID.
 *
 * @returns
 */
router.get("/get-bike/:id", (req, res) => {
    let bikeId = req.params.id;
    let bikeRef = db.collection("Bike").doc(bikeId);

    bikeRef
        .get()
        .then(bikeSnapshot => {
            if (!bikeSnapshot.exists) res.send("Bike doesn't exist");
            res.send(bikeSnapshot.get("name"));
        })
        .catch(err => {
            res.send("error");
            console.log(err);
        });
});

/**
 * GET /all-courses - Fetches all courses.
 *
 * @returns
 *
 * TODO: Better auth required here.
 */
router.get("/all-courses", (req, res) => {
    const snapshot = db.collection("Course");

    snapshot
        .get()
        .then(courseSnapshot => {
            courseSnapshot.forEach(doc => {
                console.log(doc.id, "=>", doc.data());
            });
            res.send("Courses");
        })
        .catch(err => {
            console.log(err);
        });
});

/**
 * POST /edit-bike - Edit bike details via req body
 * Expects bikeDetails as an input json request body
 * @returns
 *
 */
router.post("/edit-bike", (req, res) => {
    let bikeId = req.params.id;
    let bikeRef = db.collection("Bike").doc(bikeId);
    let bikeDetails = req.body.bikeDetails;
    bikeRef
        .update({
            coefficient_rolling_resistance: 1000,
            mass: 60,
            mechanical_efficiency: 2,
            mol_whl_front: 4,
            mol_whl_rear: 2,
            name: "carsBike3",
            wheel_radius: 5,
        })
        .then(bikeSnapshot => {
            if (!bikeSnapshot.exists) res.send("Bike doesn't exist");
            res.send(bikeSnapshot.get("name"));
        })
        .catch(err => {
            res.send("error");
            console.log(err);
        });
});

module.exports = router;
