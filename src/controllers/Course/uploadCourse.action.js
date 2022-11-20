const formidable = require("formidable");

const callPythonScript = require("../../scripts/callPythonScript");

/**
 * POST /uploadCourse - Allows the user to upload a GPX file.
 *
 * @returns
 */
const uploadCourse = async (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        const input = files.image.filepath;

        try {
            const data = await callPythonScript("gpxTransform.py", input);

            res.status(200).send(data.toString());
        } catch (err) {
            res.status(400).send("Unable to Process the GPX File.");
        }
    });
};

module.exports = uploadCourse;
