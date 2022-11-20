const admin = require("../../services/Admin.service");

/**
 * POST /course/terrain - Fetches a list of the available terrain types.
 *
 * @returns
 */
const getTerrainTypes = async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("TerrainTypes").get();
        const courses = snapshot.docs.map(doc => doc.data());

        res.status(200).send(courses[0].terrain_types);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

module.exports = getTerrainTypes;
