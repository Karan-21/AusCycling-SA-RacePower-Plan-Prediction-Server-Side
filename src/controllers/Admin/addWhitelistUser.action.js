const admin = require("../../services/Admin.service");

/**
 * POST /admin/whitelist - Adds a given email address to the whitelist.
 *
 * @returns
 */
const addWhitelistUser = async (req, res) => {
    const { email, role } = req.body;

    try {
        await admin.firestore().collection("Whitelist").doc(email).set({ role: role });

        res.status(200).send("Successfully Added Email to the Whitelist.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = addWhitelistUser;
