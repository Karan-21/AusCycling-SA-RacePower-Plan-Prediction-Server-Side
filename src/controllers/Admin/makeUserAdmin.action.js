const admin = require("../../services/Admin.service");

/**
 * POST - /admin/admin - Sets the given user as admin.
 *
 * @returns
 */
const makeUserAdmin = async (req, res) => {
    const { userId } = req.body;

    try {
        await admin.auth().setCustomUserClaims(userId, { admin: true });

        res.status(200).send("Successfully Set User as Admin.");
    } catch (err) {
        res.status(500).send("Error.");
    }
};

module.exports = makeUserAdmin;
