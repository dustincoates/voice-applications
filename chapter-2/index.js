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

    if (Number.isInteger(numOfHours)) {
      let speech;

      if(numOfHours > 12) {
        speech = "I think you may sleep too much and swing back to tired.";
      } else if(numOfHours > 8) {
        speech = "You should wake up refreshed.";
      } else if(numOfHours > 6) {
        speech = "You may get by, but watch out for a mid-day crash.";
      } else {
        speech = "You'll be dragging. Get the coffee ready!";
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

exports.handler = Alexa.SkillBuilders.standard()
                    .addRequestHandlers(WellRestedIntentHandler)
                    .lambda();
