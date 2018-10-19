const {dialogflow} = require("actions-on-google");
const functions = require("firebase-functions");

const app = dialogflow({debug: true});

app.intent("concept_application", (conv, {concept}) => {
  const responses = {
    parameter: "list out the variable pieces of information",
    "training phrase": "think of all the ways that a user might speak to the app",
    intents: "imagine what users might want to do in your application"
  };
  const response = `To add a ${concept}, ${responses[concept]}`;

  conv.close(response);
});

exports.app = functions.https.onRequest(app);
