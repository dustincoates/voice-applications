const Alexa = require("ask-sdk");
const AWS = require("aws-sdk");

const GetNameIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "GetNameIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const name = slots.name.value;

    const data = await handlerInput
                        .attributesManager
                        .getPersistentAttributes();
    
    data.name = name;

    if(name) {
      handlerInput.attributesManager.setPersistentAttributes(data);

      const speech = name + " sure is a nice name. " +
                     "What do you want to know about it?";
      const reprompt = "I could spell it for you.";

      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .getResponse();
    } else {
      return LaunchRequestHandler.handle(handlerInput);
    }
  },
};

const SpellingIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "SpellingIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const name = slots.name.value;

    const data = await handlerInput
                        .attributesManager
                        .getPersistentAttributes();

    if(name) {
      data.name = name;
    }

    if(data.name) {
      handlerInput.attributesManager.setPersistentAttributes(data);
      
      const speech = `You spell ${data.name}, ` +
                     `<say-as interpret-as="characters">${data.name}</say-as>.`;
                      
      return handlerInput.responseBuilder
        .speak(speech)
        .getResponse();
    } else {
      return LaunchRequestHandler.handle(handlerInput);
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "AMAZON.HelpIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle(handlerInput) {
    const speech =
      "Ask me for a first name to get some facts about it.";
    const reprompt =
      "Also say something like, 'What is the first letter of Joanna?'";

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  }
};

const StopOrCancelIntentHandler = {
  canHandle(handlerInput) {
    const stopIntentName = "AMAZON.StopIntent";
    const cancelIntentName = "AMAZON.CancelIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name === stopIntentName ||
        handlerInput.requestEnvelope.request.intent.name === cancelIntentName);
  },
  handle(handlerInput) {
    const speech = "Catch you on the flip side.";

    return handlerInput.responseBuilder.speak(speech).getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speech =
      "The name info skill needs you to just ask for a first name.";
    const reprompt = "Try saying, 'give me facts about the name Dustin.'";

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  }
};

const Unhandled = {
  canHandle(handlerInput) {
    return true;
  },
  handle(handlerInput) {
    const speech = "Oh, I think I misunderstand. " +
                   "Can you try once more?";
    const reprompt = "How about this. Tell me a first name.";

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};

const SavePersistenceInterceptor = {
  async process(handlerInput, response) {
    try {
      await handlerInput.attributesManager.savePersistentAttributes();
    } catch (error) {
      throw Error(error);
    }
  }
}

const skillId = "<YOUR SKILL ID>";
exports.handler = Alexa.SkillBuilders.standard()
  .addRequestHandlers(
    GetNameIntentHandler,
    SpellingIntentHandler,
    HelpIntentHandler,
    StopOrCancelIntentHandler,
    LaunchRequestHandler,
    Unhandled
  )
  .addResponseInterceptors(SavePersistenceInterceptor)
  .withSkillId(skillId)
  .withTableName("name_info")
  .withAutoCreateTable(true)
  .withDynamoDbClient(
    new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
  )
  .lambda();
