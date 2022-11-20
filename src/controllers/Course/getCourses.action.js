const admin = require("../../services/Admin.service");

/**
 * GET /courses - Returns all courses for a user.
 *
 * @returns
 *
 * TODO: Associate user with course user_id field.
 */
const getCourses = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("Course").get();
        const courses = snapshot.docs.map(doc => doc.data());

        res.status(200).send(courses);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getCourses;
