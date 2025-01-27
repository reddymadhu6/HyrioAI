const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Add your Firebase service account key JSON file here.

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
