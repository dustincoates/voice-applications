const Alexa = require("alexa-sdk");

const languageStrings = {
  "en-US": {
    translation: {
      SpaceFact: "The first American in space was Alan Shepard."
    }
  },
  "en-GB": {
    translation: {
      SpaceFact: "The first Briton in space was Helen Sharman."
    }
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
  Unhandled () {
    this.response.speak(this.t("Unhandled"));
    this.emit(":responseReady");
  }
};

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
