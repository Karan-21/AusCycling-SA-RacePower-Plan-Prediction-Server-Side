const admin = require("firebase-admin");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../bike-app-6b32a-firebase-adminsdk-ctq97-745aac3168.json");

initializeApp({
    credential: cert(serviceAccount),
});

module.exports = admin;
