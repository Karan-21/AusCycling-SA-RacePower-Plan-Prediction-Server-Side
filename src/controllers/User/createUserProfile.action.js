const admin = require("../../services/Admin.service");

/**
 * POST /user - Creates a user's profile.
 *
 * @returns
 */
const createUserProfile = async (req, res) => {
    const {
        userId,
        firstName,
        lastName,
        dateOfBirth,
        experience,
        trainingElevation,
        height,
        weight,
        gender,
        functionalThresholdPower,
        maxHeartRate,
    } = req.body;

    try {
        await admin
            .firestore()
            .collection("UserProfiles")
            .doc(userId)
            .set({
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
                experience: experience,
                training_elev: parseFloat(trainingElevation),
                height: parseFloat(height),
                weight: parseFloat(weight),
                gender: gender,
                functional_threshold_power: functionalThresholdPower,
                max_heart_rate: maxHeartRate,
            });

        res.status(200).send("Successfully Updated Profile.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = createUserProfile;
