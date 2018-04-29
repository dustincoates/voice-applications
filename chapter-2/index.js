const Alexa = require("ask-sdk");

const WellRestedIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "WellRestedIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
           handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle (handlerInput) {
    const speech = "Well rested intent";

    return handlerInput
            .responseBuilder
            .speak(speech)
            .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
                    .addRequestHandlers(WellRestedIntentHandler)
                    .lambda();
