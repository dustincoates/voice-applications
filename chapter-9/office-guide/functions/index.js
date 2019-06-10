const {dialogflow} = require("actions-on-google");
const functions = require("firebase-functions");

const app = dialogflow({debug: true});

app.intent("office_locations", (conv, {room}) => {
  const responses = {
    kitchen: "take a left and then the first right",
    "supply closet": "go to the other side of the floor, next to the devs",
    "meeting room": "it's just on your right"
  };
  const response = `To find the ${room}, ${responses[room]}`;

  conv.close(response);
});

exports.app = functions.https.onRequest(app);
