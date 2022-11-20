const { initializeApp } = require("firebase/app");
const {
    getAuth: getClientAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} = require("firebase/auth");
const { getAuth: getAdminAuth } = require("firebase-admin/auth");

initializeApp({
    apiKey: "AIzaSyC8dD8CifNnn0IhoAvVKbhRBOaIt85EtiE",
});

const clientAuth = getClientAuth();
const adminAuth = getAdminAuth();

exports.addUser = (email, password) =>
    createUserWithEmailAndPassword(clientAuth, email, password);

exports.authenticate = (email, password) =>
    signInWithEmailAndPassword(clientAuth, email, password);

exports.customToken = uid => adminAuth.createCustomToken(uid);

exports.isAuthenticated = async (req, res, next) => {
    const regex = /Bearer (.+)/i;
    try {
        const idToken = req.headers["Authorization"].match(regex)?.[1];
        req.token = await clientAuth.verifyIdToken(idToken);
        next();
    } catch (err) {
        res.status(401).json("Unauthenticated User.");
    }
};
