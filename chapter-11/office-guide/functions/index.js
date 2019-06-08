const {
  dialogflow,
  SimpleResponse,
  List,
  Suggestions,
  LinkOutSuggestion,
  NewSurface,
  RegisterUpdate,
  UpdatePermission
} = require("actions-on-google");
const functions = require("firebase-functions");

const app = dialogflow({debug: true});

app.intent("office_locations", (conv, {room}) => {
  if (!room) {
    if (conv.user.storage.lastRoomIndex === undefined) {
      conv.user.storage.lastRoomIndex = 0;
    } else {
      conv.user.storage.lastRoomIndex = conv.user.storage.lastRoomIndex + 1;
    }

    room = Object.keys(responses)[conv.user.storage.lastRoomIndex];
  }

  const responses = {
    kitchen: "take a left and then the first right",
    "supply closet": "go to the other side of the floor, next to the devs",
    "meeting room": "it's just on your right"
  };

  if (!room) {
    room = Object.keys(responses)[conv.user.storage.lastroom];
    if (room === undefined) {
      conv.user.storage.lastRoomIndex = 0;
      room = Object.keys(responses)[conv.user.storage.lastRoomIndex];
    }
  }

  const response = `To find the ${room}, ${responses[room]}`;

  const displayTexts = {
    kitchen: "The kitchen is to your left and then a right. " +
               "Grab a snack or a drink, on the house.",
    "supply closet": "For the supply closet, you'll go all the way around " +
                        "until you reach the developers. " +
                        "Find the cleaning supplies, paper, and paper clips.",
    "meeting room": "Look to your right and you'll see the meeting room. " +
               "This meeting room seats six people and you can " +
               "book it online."
  };

  const displayText = displayTexts[room];

  if (!conv.user.storage.update) {
    conv.ask(new Suggestions("Get a daily update"));
    conv.ask(new SimpleResponse({
      speech: response,
      text: displayText
    }));
  } else {
    conv.close(new SimpleResponse({
      speech: response,
      text: displayText
    }));
  }
});

const upcomingEvents = {
  "JS Ninjas": {
    synonyms: [
      "JavaScript ninjas",
      "JavaScript devs"
    ],
    title: "JS Ninjas Over Lunch",
    description: "Friday at noon"
  },
  "NLP Study Group": {
    synonyms: [
      "natural language group",
      "NLP group"
    ],
    title: "Natural Language Processing Study Group",
    description: "Monday evening"
  }
};

app.intent("get_events", (conv) => {
  if(conv.surface.capabilities.has("actions.capability.SCREEN_OUTPUT")) {
    const list = new List({
      title: "Upcoming Events",
      items: upcomingEvents
    });
    conv.close("We have upcoming events for JavaScript and voice-first dev. " +
               "You can choose one from the list on the screen to hear more.");
    conv.close(new Suggestions("Get to the meeting room"));
    conv.close(new LinkOutSuggestion({
      name: "View All",
      url:  "https://www.example.com/upcoming-events"
    }));
    conv.close(list);
  } else {
    if (
      conv
        .available
        .surfaces
        .capabilities
        .has("actions.capability.SCREEN_OUTPUT")
    ) {
      const context = "We have upcoming events for JavaScript and " +
                      "voice-first dev. I can show you a list.";
      const notification = "Upcoming events";
      const capabilities = ["actions.capability.SCREEN_OUTPUT"];
      conv.ask(new NewSurface({context, notification, capabilities}));
    } else {
      conv.close("We have upcoming events for JavaScript and voice-first dev.");
    }
  }
});

const upcomingEventsSelect = {
  "JS Ninjas": "JS Ninjas is a monthly lunch gathering of JavaScript devs " +
               "who come together to discuss best practices.",
  "NLP Study Group": "Come study natural language processing with some of " +
                     "smartest people around."
};

app.intent("actions.intent.OPTION", (conv, params, option) => {
  const response = upcomingEventsSelect[option];

  conv.close(response);
});

app.intent("actions.intent.NEW_SURFACE", (conv, input, newSurface) => {
  if (newSurface.status === "OK") {
    const list = new List({
      title: "Upcoming Events",
      items: upcomingEvents
    });

    conv.close(new Suggestions("Get to the meeting room"));
    conv.close(new LinkOutSuggestion({
      name: "View All",
      url:  "https://www.example.com/upcoming-events"
    }));
    conv.close(list);
    conv.close("Alright, here's your list of upcoming events. " +
                "You can choose one on the screen to hear more.");
  } else {
    conv.close("All good. Let me know if you want to see a list or hear more.");
  }
});

app.intent("daily_registration", conv => {
  conv.ask(new RegisterUpdate({
    intent: "office_locations",
    frequency: "DAILY"
  }));
});

app.intent("daily_registration_completion", (conv, params, registered) => {
  if (registered && registered.status === "OK") {
    conv.user.storage.update = true;
    conv.close("Ok, starting tomorrow you'll get daily updates.");
  } else {
    conv.close("Alright, I won't be sending you updates each day after all.");
  }
});

app.intent("notification_registration", conv => {
  conv.ask(new UpdatePermission({
    intent: "office_locations"
  }));
});

app.intent("notification_registration_completion", (conv, params, permission) => {
  if (permission) {
    const userID = conv.arguments.get("UPDATES_USER_ID");
    const intentName = "office_locations";
    console.log(userID);
    conv.close("Okay, got you registered! You'll start getting notifications");
  } else {
    conv.close("Ahh, no worries. No notifications for you.");
  }
});

exports.app = functions.https.onRequest(app);
