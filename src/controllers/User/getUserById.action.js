const admin = require("../../services/Admin.service");

/**
 * GET /user/:id - Fetches a users by their id and returns their data.
 *
 * @returns
 */
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await admin.firestore().collection("UserProfiles").doc(id).get();

        res.status(200).send(user.data());
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getUserById;
