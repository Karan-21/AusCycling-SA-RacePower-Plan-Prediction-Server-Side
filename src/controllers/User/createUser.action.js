const admin = require("../../services/Admin.service");

/**
 * POST /signup - Creates a new user.
 *
 * @returns
 */
const createUser = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const snapshot = await admin.firestore().collection("Whitelist").get();

        let whitelist = {};
        snapshot.docs.map(doc => (whitelist[doc.id] = doc.data()));

        if (!!whitelist[email]) {
            const user = await admin.auth().createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
            });

            if (whitelist[email].role === "admin") {
                await admin.auth().setCustomUserClaims(user?.uid, { admin: true });
            }

            res.status(200).send(user);
        } else {
            res.status(401).send("User Not Whitelisted.");
        }
    } catch (err) {
        switch (err.code) {
            case "auth/email-already-exists":
                res.status(400).send("Email Already Exists.");
                break;
            case "auth/invalid-password":
                res.status(400).send("Password Must Be at Least 6 Characters.");
                break;
            default:
                res.status(500).send("Unknown Error.");
        }
    }
};

module.exports = createUser;
