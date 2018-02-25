const Alexa = require("alexa-sdk");

const languageStrings = {
  "en-US": {
    translation: {
      SpaceFact: "The first American in space was Alan Shepard.",
      PlanetDistance: "The planet {{name}} is {{km}} kilometers," +
                      " or {{mi}} miles, from the Sun."
    }
  },
  "en-GB": {
    translation: {
      SpaceFact: "The first Briton in space was Helen Sharman.",
      PlanetDistance: "The planet {{name}} is {{km}} kilometers from the Sun."
    }
  },
  fallback: {
    Unhandled: "I can't do that right now.",
    UnknownPlanet: "I'm afraid I don't have data for that planet."
  }
};

const planets = {
  mercury: {
    name: "Mercury",
    km: 69816900,
    mi: 43400000,
  },
  venus: {
    name: "Venus",
    km: 108939000,
    mi: 67700000
  },
  earth: {
    name: "Earth",
    km: 152100000,
    mi: 94500000
  },
  mars: {
    name: "Mars",
    km: 249200000,
    mi: 155000000
  },
  jupiter: {
    name: "Jupiter",
    km: 816620000,
    mi: 507000000
  },
  saturn: {
    name: "Saturn",
    km: 1514500000,
    mi: 941000000
  },
  uranus: {
    name: "Uranus",
    km: 3000000000,
    mi: 1869000000
  },
  neptune: {
    name: "Neptune",
    km: 4537000000,
    mi: 2819000000
  }
};

const handlers = {
  LaunchRequest () {
    this.emit("GetFactIntent");
  },
  GetFactIntent () {
    this.response.speak(this.t("SpaceFact"));
    this.emit(":responseReady");
  },
  GetDistanceIntent () {
    let values;

    if(
      this.event.request.intent &&
      this.event.request.intent.slots &&
      this.event.request.intent.slots.Planet
    ) {
      values = this
                .event
                .request
                .intent
                .slots
                .Planet
                .resolutions
                .resolutionsPerAuthority[0]
                .values;
    }

    let speech;

    if(values && planets[values[0].value.id.toLowerCase()]) {
      const planet = planets[values[0].value.id.toLowerCase()];

      speech = this.t("PlanetDistance", planet);
    } else {
      speech = this.t(["UnknownPlanet", languageStrings.fallback.UnknownPlanet]);
    }

    this.response.speak(speech);
    this.emit(":responseReady");
  },
  Unhandled () {
    this.response.speak(this.t(["Unhandled", languageStrings.fallback.Unhandled]));
    this.emit(":responseReady");
  }
};

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
