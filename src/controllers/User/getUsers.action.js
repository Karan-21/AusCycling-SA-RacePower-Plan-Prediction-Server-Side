const admin = require("../../services/Admin.service");

/**
 * GET /user - Fetches the list of users.
 *
 * @returns
 */
const getUsers = async (req, res) => {
    try {
        const users = await admin.auth().listUsers();

        res.status(200).send(users);
    } catch (err) {
        console.log(err);
    }
};

module.exports = getUsers;
