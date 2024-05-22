var admin = require("firebase-admin");
var serviceAccount = require("./tsmarts-firebase-adminsdk-2afsu-6d890bf738.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


module.exports = admin;