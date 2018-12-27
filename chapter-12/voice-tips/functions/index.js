const {
  dialogflow,
  SimpleResponse,
  List,
  Suggestions,
  LinkOutSuggestion,
  NewSurface,
  RegisterUpdate
} = require("actions-on-google");
const functions = require("firebase-functions");

const app = dialogflow({debug: true});

app.intent("concept_application", (conv, {concept}) => {
  if (!concept) {
    if (conv.user.storage.lastConcept === undefined) {
      conv.user.storage.lastConcept = 0;
    } else {
      conv.user.storage.lastConcept = conv.user.storage.lastConcept + 1;
    }
  }

  const responses = {
    parameter: "list out the variable pieces of information",
    "training phrase": "think of all the ways that a user might speak to the app",
    intents: "imagine what users might want to do in your application"
  };

  if (!concept) {
    concept = Object.keys(responses)[conv.user.storage.lastConcept];
    if (concept === undefined) {
      conv.user.storage.lastConcept = 0;
      concept = Object.keys(responses)[conv.user.storage.lastConcept];
  }
  }

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

  if (!conv.user.storage.update) {
    conv.ask(new Suggestions("Get a daily update"));
  }

  conv.ask(new SimpleResponse({
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

  if(conv.surface.capabilities.has("actions.capability.SCREEN_OUTPUT")) {
    conv.close(new Suggestions("How to add a parameter"));
    conv.close(new LinkOutSuggestion({
      name: "View All",
      url: "https://dialogflow.com/docs/reference/system-entities"
    }));
    conv.close(list);
    conv.close("Some popular system entities include color, time, and names. " +
               "You can choose one from the list on the screen to hear more.");
  } else {
    if (
      conv
        .available
        .surfaces
        .capabilities
        .has("actions.capability.SCREEN_OUTPUT")
    ) {
      const context = "Some popular system entities include color, time, and " +
                      "names. I can show you a list.";
      const notification = "System Entities";
      const capabilities = ["actions.capability.SCREEN_OUTPUT"];
      conv.ask(new NewSurface({context, notification, capabilities}));
    } else {
      conv.close("Some popular system entities include color, time, and names.");
    }
  }
});

app.intent("actions.intent.NEW_SURFACE", (conv, input, newSurface) => {
  if (newSurface.status === "OK") {
    const list = new List({
      title: "System Entities",
      items: systemEntities
    });

    conv.close(new Suggestions("How to add a parameter"));
    conv.close(new LinkOutSuggestion({
      name: "View All",
      url: "https://dialogflow.com/docs/reference/system-entities"
    }));
    conv.close(list);
    conv.close("Alright, here's your list of system entities. " +
                "You can choose one on the screen to hear more.");
  } else {
    conv.close("All good. Let me know if you want to see a list or hear more.");
  }
});

const systemEntityDescriptions = {
  "date time": "The date time entity takes a natural language description, " +
               "like tomorrow at 8 and returns an " +
               "<say-as interpret-as='verbatim'>ISO " +
               "8601</say-as> timestamp.",
  "last name": "The last name entity matches popular last names as strings.",
  // Add more here to fill out the list
};

app.intent("actions.intent.OPTION", (conv, params, option) => {
  const response = systemEntityDescriptions[option];

  conv.close(response);
});

app.intent("daily_registration", conv => {
  conv.ask(new RegisterUpdate({
    intent: "concept_application",
    frequency: "DAILY"
  }));
});

exports.app = functions.https.onRequest(app);
