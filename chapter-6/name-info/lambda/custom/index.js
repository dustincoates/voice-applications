const Alexa = require("ask-sdk");
const AWS = require("aws-sdk");

const SavePersistenceInterceptor = {
  async process(handlerInput, response) {
    try {
      await handlerInput.attributesManager.savePersistentAttributes();
    } catch (error) {
      throw Error(error);
    }
  }
};

const GetPersistenceInterceptor = {
  async process(handlerInput) {
    try {
      const data = await handlerInput
                          .attributesManager
                          .getPersistentAttributes();
      const attributes = handlerInput
                          .attributesManager
                          .getRequestAttributes();

      attributes.data = data;

      handlerInput.attributesManager.setRequestAttributes(attributes);
    } catch (error) {
      throw Error(error);
    }
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

const GetNameIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "GetNameIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const name = slots.name.value;

    const attributes = handlerInput
                        .attributesManager
                        .getRequestAttributes();
    data = attributes.data;

    data.name = name;

    if (name) {
      handlerInput.attributesManager.setPersistentAttributes(data);
      await handlerInput.attributesManager.savePersistentAttributes(data);

      const speech = name + " sure is a nice name. " +
                     "What do you want to know about it?";
      const reprompt = "I could spell it for you.";

      return handlerInput.responseBuilder
        .speak(speech)
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

    const attributes = handlerInput
                        .attributesManager
                        .getRequestAttributes();
    data = attributes.data;

    if(name) {
      data.name = name;
    }

    if(data.name) {
      handlerInput.attributesManager.setPersistentAttributes(data);

      const speech = `You spell ${data.name}, ${data.name.split("").join(" ")}.`;

      return handlerInput.responseBuilder
        .speak(speech)
        .getResponse();
    } else {
      return LaunchRequestHandler.handle(handlerInput);
    }
  },
};

const skillId = "<YOUR SKILL ID>";
exports.handler = Alexa.SkillBuilders.standard()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNameIntentHandler,
    SpellingIntentHandler
  )
  .withSkillId(skillId)
  .addResponseInterceptors(SavePersistenceInterceptor)
  .addRequestInterceptors(GetPersistenceInterceptor)
  .withTableName("name_info")
  .withAutoCreateTable(true)
  .withDynamoDbClient(
    new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
  )
  .lambda();
