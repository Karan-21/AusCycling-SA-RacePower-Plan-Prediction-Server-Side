const admin = require("../../services/Admin.service");

exports.getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        req.authToken = req.headers.authorization.split(" ")[1];
    } else {
        req.authToken = null;
    }
    next();
};

exports.checkIfAdmin = (req, res, next) => {
    this.getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await admin.auth().verifyIdToken(authToken);

            if (userInfo.admin === true) {
                req.authId = userInfo.uid;
                return next();
            }

            throw new Error("Unauthorised User");
        } catch (err) {
            res.status(401).send("Unauthorised User.");
        }
    });
};

exports.checkIfAuthenticated = (req, res, next) => {
    this.getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await admin.auth().verifyIdToken(authToken);

            req.authId = userInfo.uid;

            return next();
        } catch (err) {
            res.status(401).send("Unauthorised User.");
        }
    });
};
