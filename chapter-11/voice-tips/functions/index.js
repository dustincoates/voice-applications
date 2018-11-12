const {
  dialogflow,
  SimpleResponse,
  List
} = require("actions-on-google");
const functions = require("firebase-functions");

const app = dialogflow({debug: true});

app.intent("concept_application", (conv, {concept}) => {
  const responses = {
    parameter: "list out the variable pieces of information",
    "training phrase": "think of all the ways that a user might speak to the app",
    intents: "imagine what users might want to do in your application"
  };
  const response = `To add a ${concept}, ${responses[concept]}`;

  const displayTexts = {
    parameter: "A parameter is a variable piece of info that you can add by " +
               "making a list of all the ways people might reference that thing.",
    "training phrases": "Training phrases are the different ways people will " +
                        "state their intent. Find a partner to role play the " +
                        "user and the device to develop the requests.",
    "intents": "An intent is what the user wants to do in your application. " +
               "You don't need to support everything, but you should respond " +
               "to likely requests."
  };
  const displayText = displayTexts[concept];

  conv.close(new SimpleResponse({
    speech: response,
    text: displayText
  }));
});

const systemEntities = {
  "date time": {
    synonyms: [
      "time and date",
      "sis date time"
    ],
    title: "@sys.date-time",
    description: "Friday at noon"
  },
  "last name": {
    synonyms: [
      "family name",
      "sis family name"
    ],
    title: "@sys.last-name",
    description: "Rodriguez, Smith, Friedman"
  },
  // Add more here to fill out the list
};

app.intent("get_entities", (conv) => {
  const list = new List({
    title: "System Entities",
    items: systemEntities
  });

  conv.close("Some popular system entities include color, time, and names.");
  conv.close(list);
});

exports.app = functions.https.onRequest(app);
