const admin = require("../../services/Admin.service");

/**
 * GET /admin/whitelist - Fetches a list of whitelisted users.
 *
 * @returns
 */
const getWhitelist = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("Whitelist").get();

        let whitelist = {};
        snapshot.docs.map(doc => (whitelist[doc.id] = doc.data()));

        res.status(200).send(whitelist);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getWhitelist;
