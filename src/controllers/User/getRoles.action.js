const admin = require("../../services/Admin.service");

/**
 * GET /user/roles - Fetches a list of the available roles.
 *
 * @returns
 */
const getRoles = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("Roles").get();
        const courses = snapshot.docs.map(doc => doc.data());

        console.log(courses);

        res.status(200).send(courses[0].roles);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getRoles;
