const admin = require("../../services/Admin.service");

/**
 * POST /bike - Creates a new bike.
 *
 * @returns
 */
const addBike = async (req, res) => {
    const {
        userId,
        bikeName,
        bikeType,
        bikeWeight,
        bikeComponent,
        frontWheelType,
        frontWheelWidthType,
        rearWheelType,
        rearWheelWidthType,
        tireType,
        tubeType,
        racingPosition,
        climbingPosition,
        helmetType,
        rollingResistance,
        mechanicalLoss,
    } = req.body;

    try {
        const newBikeRef = await admin.firestore().collection("Bike").doc();
        await newBikeRef.set({
            user_id: userId,
            created_at: Math.floor(Date.now() / 1000),
            bike_name: bikeName,
            bike_type: bikeType,
            bike_weight: parseFloat(bikeWeight),
            bike_component: bikeComponent,
            front_wheel_type: frontWheelType,
            front_wheel_width: frontWheelWidthType,
            rear_wheel_type: rearWheelType,
            rear_wheel_width: rearWheelWidthType,
            tire_type: tireType,
            tube_type: tubeType,
            racing_pos: racingPosition,
            climbing_pos: climbingPosition,
            helmet_type: helmetType,
            coefficient_rolling_resistance: parseFloat(rollingResistance),
            mechanical_loss: parseFloat(mechanicalLoss),
        });
        const bike = await newBikeRef.get();

        res.status(200).send({
            data: { id: newBikeRef.id, bike: bike.data() },
            message: "Successfully Added Bike.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = addBike;
