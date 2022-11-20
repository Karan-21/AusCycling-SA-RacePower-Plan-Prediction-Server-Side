const { getFirestore } = require("firebase-admin/firestore");

/**
 * POST /edit-bike - Edit bike details via req body
 * Expects bikeDetails as an input json request body
 * @returns
 *
 */
const deleteBike = async (req, res) => {
    const db = getFirestore();
    const id = req.params.id;
    let bikeRef = db.collection("Bike").doc(id);
    try {
        const deleteDetails = await bikeRef.delete();
        res.status(200).send(deleteDetails);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = deleteBike;
