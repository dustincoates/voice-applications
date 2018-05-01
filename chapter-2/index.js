const Alexa = require("ask-sdk");

const WellRestedIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "WellRestedIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
           handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle(handlerInput) {
    const slots = handlerInput
                      .requestEnvelope
                      .request
                      .intent
                      .slots;

    let numOfHours = slots.NumberOfHours.value;
    numOfHours = parseInt(numOfHours);

    const quality = slots.SleepQuality.value;

    const good = ["good", "well", "wonderfully", "a lot", "amazing",
                  "fantastic", "great", "not bad"];
    const bad = ["bad", "poorly", "little", "very little", "not at all"];

    if (Number.isInteger(numOfHours)) {
      let speech;

      if(good.includes(quality)) {
        numOfHours += 1;
        speech = "You slept well last night, and "
      }

      if(bad.includes(quality)) {
        numOfHours -= 1;
        speech = "You slept poorly last night, and "
      }

      if(numOfHours > 12) {
        speech += "I think you may sleep too much and swing back to "
                  + "tired tomorrow.";
      } else if(numOfHours > 8) {
        speech += "tomorrow you should wake up refreshed.";
      } else if(numOfHours > 6) {
        speech += "in the morning you may get by, but watch out for a "
                  + "mid-day crash.";
      } else {
        speech += "tomorrow you'll be dragging. Get the coffee ready!";
      }

      return handlerInput
              .responseBuilder
              .speak(speech)
              .getResponse();
    } else {
      console.log("Slot values ", slots);

      const speech = "Oh, I don't know what happened. Tell me again. " +
                     "How many hours will you sleep tonight?";
      const reprompt = "How many hours are you going to sleep tonight?";

      return handlerInput
              .responseBuilder
              .speak(speech)
              .reprompt(reprompt)
              .getResponse();
    }
  }
};

exports.handler = Alexa.SkillBuilders.custom()
                    .addRequestHandlers(WellRestedIntentHandler)
                    .lambda();
