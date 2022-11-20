const admin = require("../../services/Admin.service");

/**
 * GET /bike/:id - Returns a list of bikes associated with a user.
 *
 * @returns
 */
const getBikesForUser = async (req, res) => {
    const { id } = req.params;

    try {
        const snapshot = await admin
            .firestore()
            .collection("Bike")
            .where("user_id", "==", id)
            .get();

        let bikes = {};
        snapshot.docs.map(doc => (bikes[doc.id] = doc.data()));

        res.status(200).send(bikes);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getBikesForUser;
