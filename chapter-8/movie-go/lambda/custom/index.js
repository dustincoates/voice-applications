const Alexa = require("ask-sdk-core");

function friendlyTime (timeStr) {
  let [hours, minutes] = timeStr.split(":");
  let meridian;
  let friendlyStr;

  hours = parseInt(hours);

  if (hours >= 12) {
    hours = hours - 12;
    meridian = "p.m.";
  } else {
    meridian = "a.m.";
  }

  if (hours === 0) {
    hours = 12;
  }

  if (minutes === "15") {
    friendlyStr = `a quarter after ${hours} ${meridian}`;
  } else if (minutes === "00") {
    friendlyStr = `${hours}:${meridian}`;
  } else {
    friendlyStr = `${hours}:${minutes} ${meridian}`;
  }

  return friendlyStr;
}

const BuyTicketsIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "BuyTicketsIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle(handlerInput) {
    const dialogComplete = "COMPLETED";
    const dialogStarted = "STARTED";
    const intent = handlerInput.requestEnvelope.request.intent;
    const ticketPrice = 10;

    if (handlerInput.requestEnvelope.request.dialogState !== dialogComplete) {
      if (handlerInput.requestEnvelope.request.dialogState === dialogStarted) {
        intent.slots.TicketsNumber.value = intent.slots.TicketsNumber.value || 1;
      }

      if (
        intent.slots.MovieTime.value &&
        intent.slots.MovieTime.confirmationStatus !== "CONFIRMED"
      ) {
        let movieTime = intent.slots.MovieTime.value;
        movieTime = friendlyTime(intent.slots.MovieTime.value);

        intent.slots.MovieTime.value = movieTime;
      }

      return handlerInput.responseBuilder
        .addDelegateDirective(intent)
        .getResponse();
    } else {
      const movieName = intent.slots.MovieName.value;
      const movieTime = intent.slots.MovieTime.value;
      let ticketsNumber = intent.slots.TicketsNumber.value;

      if (ticketsNumber) {
        ticketsNumber = parseInt(ticketsNumber);
      } else {
        ticketsNumber = 1;
      }

      const price = ticketsNumber * ticketPrice;

      const speech = `Alright <break strength="strong" /> ${ticketsNumber} ` +
                     `for ${movieName}. Total cost, $${price}, and the movie ` +
                     `starts at ${movieTime}.`;

      return handlerInput.responseBuilder
        .speak(speech)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const intentName = "AMAZON.HelpIntent";

    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  handle(handlerInput) {
    const speech = "You can buy movie tickets by telling me which movie you wanna see.";
    const reprompt = "How about starting with 'I want to buy tickets?'";

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
    const speech = "Come back! See you soon.";

    return handlerInput.responseBuilder.speak(speech).getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speech = "Welcome to Movie Go where you can buy tickets. Which movie do you wanna see?";
    const reprompt = "Try saying, 'I wanna see' and then the name of a movie.";

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
    const speech = "Oh, I think I misunderstood. Can you try once more?";
    const reprompt = "How about this. Say which movie you want to see.";

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  }
};

const skillId = "<YOUR SKILL ID>";
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    BuyTicketsIntentHandler,
    HelpIntentHandler,
    StopOrCancelIntentHandler,
    LaunchRequestHandler,
    Unhandled
  )
  .withSkillId(skillId)
  .lambda();
