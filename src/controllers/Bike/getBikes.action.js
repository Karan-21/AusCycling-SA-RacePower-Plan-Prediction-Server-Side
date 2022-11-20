const { getFirestore } = require("firebase-admin/firestore");

const getBikes = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("Bike").get();
        const bikes = snapshot.docs.map(doc => doc.data());

        res.status(200).send(bikes);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getBikes;
