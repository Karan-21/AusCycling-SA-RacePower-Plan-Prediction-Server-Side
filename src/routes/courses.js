/**
 * @fileoverview Contains routes concerned with Course CRUD functionality.
 */

// NODE OR NPM RELATED IMPORTS
const express = require("express");
const formidable = require("formidable");

// FIREBASE RELATED IMPORTS
const { getFirestore } = require("firebase-admin/firestore");

// LOCAL IMPORTS
const callPythonScript = require("../scripts/callPythonScript");

const router = express.Router();
const db = getFirestore();
const userService = require("../services/User.service");

// Authorisation Block
router.use(userService.isAuthenticated);

/**
 * POST /upload-course - Allows the user to upload a GPX file.
 *
 * @returns
 */
router.post("/upload-course", (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        const input = files.image.filepath;

        try {
            const data = await callPythonScript("gpxTransform.py", input);

            res.status(200).send(data.toString());
        } catch (err) {
            res.status(400).send("Unable to Process the GPX File.");
        }
    });
});

/**
 * POST /add-course - Creates a course for a user.
 *
 * @returns
 */
router.post("/add-course", function (req, res) {
    const course = req.body;
    if (
        "distance" in course &&
        "gpx_data" in course &&
        "name" in course &&
        "point_location" in course
    ) {
        const courseRef = db.collection("Course");
        const user_id = req.session.user["_ref"]["_path"]["segments"][1];
        const query = courseRef
            .where("name", "==", course.name)
            .where("user_id", "==", user_id)
            .get(); // If course exists for that user.
        let courseData;
        query
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    courseData = doc;
                });
                // No user found, so create one.
                if (courseData == null) {
                    let dis = course.distance;
                    let gpx = course.gpx_data;
                    let name = course.name;
                    let points = course.point_location;
                    let time = Date.now();

                    const data = {
                        distance: dis,
                        gpx_data: gpx,
                        name: name,
                        point_location: points,
                        created: time,
                        user_id: user_id,
                    };
                    courseRef.add(data);
                    res.status(200).send("Sucessfully added Course");
                } else {
                    res.status(409).send("Course already exists");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
    } else {
        res.status(400).send("Wrong Request");
    }
});

/**
 * GET /all-courses - Returns all courses for a user.
 *
 * @returns
 */
router.get("/all-courses", (req, res) => {
    const user_id = req.session.user["_ref"]["_path"]["segments"][1];
    const snapshot = db.collection("Course");
    const query = snapshot.where("user_id", "==", user_id);

    let result = [];
    query
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                console.log(doc.id, "=>", doc.data());
                data = doc.data();
                data.id = doc.id;
                result.push(data);
            });

            res.status(200).send(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

/**
 * GET /get-course/:id - Returns a singular course for a user given its ID.
 *
 * @returns
 */
router.get("/get-course/:id", (req, res) => {
    const courseId = req.params.id;
    const user_id = req.session.user["_ref"]["_path"]["segments"][1];
    const courseRef = db.collection("Course");
    const query = courseRef.where("user_id", "==", user_id);

    let result = {};
    query
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if (doc.id == courseId) {
                    console.log(doc.id, "=>", doc.data());
                    data = doc.data();
                    data.id = doc.id;
                    result = data; // Can't use break to terminate early
                }
            });

            res.status(200).send(result);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

/**
 * DELETE /delete-course/:id - Deletes a singular course for a user given its ID.
 *
 * @returns
 */
router.delete("/delete-course/:id", (req, res) => {
    const courseId = req.params.id;
    const user_id = req.session.user["_ref"]["_path"]["segments"][1];
    const courseRef = db.collection("Course");
    const query = courseRef.where("user_id", "==", user_id);

    query
        .get()
        .then(querySnapshot => {
            doc = querySnapshot.docs.filter(doc => doc.id == courseId)[0];

            if (doc) {
                doc.ref.delete();
                res.status(200).send("Sucessfully deleted course");
            } else {
                res.status(204).send(
                    "Sucessfully deleted nothing (as it did not exist for current user)"
                );
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

module.exports = router;
