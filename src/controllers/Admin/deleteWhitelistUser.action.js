const admin = require("../../services/Admin.service");

/**
 * DELETE /admin/whitelist - Removes a given email address from the whitelist.
 *
 * @returns
 */
const deleteWhitelistUser = async (req, res) => {
    const { email } = req.body;

    try {
        await admin.firestore().collection("Whitelist").doc(email).delete();

        res.status(200).send(`Successfully Removed Email From the Whitelist.`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = deleteWhitelistUser;
