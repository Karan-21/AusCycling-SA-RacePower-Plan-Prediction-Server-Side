const admin = require("../../services/Admin.service");

/**
 * GET /bike/:id - Fetches a bike by its id and returns the data.
 *
 * @returns
 */
const getBikeById = async (req, res) => {
    const { id } = req.params;

    try {
        const bike = await admin.firestore().collection("Bike").doc(id).get();

        res.status(200).send({
            data: { id: id, bike: bike.data() },
        });
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getBikeById;
