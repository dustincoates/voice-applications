const Alexa = require("ask-sdk");
const AWS = require("aws-sdk");
const MessageFormat = require("messageformat");
const Messages = require("messageformat/messages");

const languageStrings = {
  "en-US": {
    LaunchRequestReprompt: "Try saying, 'give me facts about the name Dustin.'"
  },
  "en-GB": {
    LaunchRequestReprompt: "Try saying, 'give me facts about the name Aida.'"
  },
  "en": {
    LaunchRequestSpeech: "Name info needs you to just ask for a first name.",
    HelpIntentSpeech: "Ask me for a first name to get some facts about it.",
    HelpIntentReprompt: "Also say something like, 'What is the first letter of Joanna?'",
    StopOrCancelIntentSpeech: "Catch you on the flip side.",
    UnhandledSpeech: "Oh, I think I misunderstood. Can you try once more?",
    UnhandledReprompt: "How about this. Tell me a first name."
  }
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const fallbackLocale = "en";
    const locale = handlerInput.requestEnvelope.request.locale;

    const messageFormat = new MessageFormat(Object.keys(languageStrings));
    const compiledStrings = messageFormat.compile(languageStrings);
    const messages = new Messages(compiledStrings, locale);

    messages.setFallback(locale, [fallbackLocale]);

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.responses = messages;
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
    const speech = responses.get("HelpIntentSpeech");
    const reprompt = responses.get("HelpIntentReprompt");

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
    const speech = responses.get("StopOrCancelIntentSpeech");

    return handlerInput.responseBuilder.speak(speech).getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput
                            .attributesManager
                            .getRequestAttributes();                     
    const { responses } = requestAttributes;

    const speech = responses.get("LaunchRequestSpeech");
    const reprompt = responses.get("LaunchRequestReprompt");

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
    const speech = responses.get("UnhandledSpeech");
    const reprompt = responses.get("UnhandledReprompt");

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
};

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
  .addRequestInterceptors(LocalizationInterceptor)
  .addResponseInterceptors(SavePersistenceInterceptor)
  .withSkillId(skillId)
  .withTableName("name_info")
  .withAutoCreateTable(true)
  .withDynamoDbClient(
    new AWS.DynamoDB({ apiVersion: "latest", region: "us-east-1" })
  )
  .lambda();
