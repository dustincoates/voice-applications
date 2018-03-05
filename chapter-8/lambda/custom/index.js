"use strict";
const Alexa = require("alexa-sdk");

const languageStrings = {
  "en-US": {
    translation: {
      BuyTickets: "Alright, {{NumberTickets}} tickets for {{MovieName}}" +
                  " coming up! That'll be ${{Price}} in all."
    }
  },
  fallback: {
    Unhandled: "I can't do that at the moment! How about buying tickets?",
    UnhandledPrompt: "Tell me the movie you want to see."
  }
};

const handlers = {
  LaunchRequest () {
    this.emit("BuyTicketsIntent");
  },
  BuyTicketsIntent () {
    if(this.event.request.dialogState !== "COMPLETED"){
      this.emit(":delegate");
    } else {
      const movie = {
        NumberTickets: parseFloat(this.event.request.intent.slots.NumberTickets.value),
        MovieName: this.event.request.intent.slots.MovieName.value
      };

      movie.Price = movie.NumberTickets * 10;

      if(this.event.request.intent.slots.Discounts.value) {
        movie.Price = movie.Price / 2;
      }

      const speak = this.t("BuyTickets", movie);
      this.response.speak(speak);
      this.emit(":responseReady");
    }
  },
  Unhandled () {
    const speak = this.t(["Unhandled", languageStrings.fallback.Unhandled]);
    const listen = this.t([
      "UnhandledPrompt", languageStrings.fallback.UnhandledPrompt
    ]);
    this.response
      .speak(speak)
      .listen(listen);
    this.emit(":responseReady");
  }
};

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
