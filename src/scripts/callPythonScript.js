const { PythonShell } = require("python-shell");

/**
 * Allows JS to call python scripts as child processes.
 *
 * @param {string} scriptToCall - The name of the script to call.
 * @param {string} data - The path to the files XML (e.g. "/tmp/3faac6ba...").
 *
 * @returns The resulting dataframe after some preprocessing.
 */
const callPythonScript = async (scriptToCall, data) => {
    let options = {
        mode: "text",
        scriptPath: "./src/scripts",
        args: [data],
    };

    const {
        success,
        err = "",
        results,
    } = await new Promise((resolve, reject) => {
        PythonShell.run(scriptToCall, options, (err, results) => {
            if (err) {
                reject({ success: false, err });
            }

            resolve({ success: true, results });
        });
    });

    return success ? results : err;
};

module.exports = callPythonScript;
