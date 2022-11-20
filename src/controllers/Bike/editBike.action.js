const admin = require("../../services/Admin.service");

/**
 * POST /bike/:bikeId - Edit bike details via req body
 *
 * @returns
 */
const editBike = async (req, res) => {
    const { id } = req.params;
    const {
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
        await admin
            .firestore()
            .collection("Bike")
            .doc(id)
            .update({
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
        const bike = await admin.firestore().collection("Bike").doc(id).get();

        res.status(200).send({
            data: { id: id, bike: bike.data() },
            message: "Successfully Edited Bike.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = editBike;
