const admin = require("../../services/Admin.service");

/**
 * UPDATE /admin/whitelist - Updates a whitelisted users details.
 *
 * @returns
 */
const editWhitelistUser = async (req, res) => {
    const { oldEmail, email, role } = req.body;

    try {
        if (email !== oldEmail) {
            await admin.firestore().collection("Whitelist").doc(oldEmail).delete();
        }

        await admin.firestore().collection("Whitelist").doc(email).set({ role: role });

        res.status(200).send(`Successfully Edited Whitelisted Email.`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = editWhitelistUser;
