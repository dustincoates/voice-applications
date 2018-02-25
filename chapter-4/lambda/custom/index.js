const Alexa = require('alexa-sdk');

const states = {
  TOO_MUCH: '_TOO_MUCH',
  WAKING: '_WAKING'
};

function pluralize(count, singular, plural) {
  if(count === 1) {
    return `${count} ${singular}`;
  } else {
    return `${count} ${plural}`;
  }
}

const handlers = {
  WellRestedIntent () {
    this.attributes.lastIntent = "WellRestedIntent";
    const slotValue = this.event.request.intent.slots.NumberOfHours.value;
    const numOfHours = parseInt(slotValue);

    if(Number.isInteger(numOfHours)) {
      let speech;
      if(numOfHours > 12) {
        this.handler.state = states.TOO_MUCH;
        speech = "That's a lot of sleep. Are you sure?";
        const reprompt = `Did I hear right that you'll sleep ${numOfHours} hours?`;
        this.emit(":ask", speech, reprompt);
      } else if(numOfHours > 8) {
        speech = "You should wake up refreshed.";
      } else if(numOfHours > 6) {
        speech = "You may get by, but watch out for a mid-day crash.";
      } else {
        speech = "You will be dragging tomorrow. Get the coffee ready!";
      }

      this.emit(":tell", speech);
    } else {
      console.log(`Slot value: ${slotValue}`);

      const prompt = "I'm sorry, I heard something that doesn't seem like" +
                      " a number. How many hours of sleep do you want?";
      const reprompt = "Tell me how many hours you plan to sleep.";
      this.emit(":ask", prompt, reprompt);
    }

  },
  SleepQualityIntent () {
    this.attributes.lastIntent = "SleepQualityIntent";
    const quality = this
                      .event
                      .request
                      .intent
                      .slots
                      .PreviousNightQuality
                      .resolutions
                      .resolutionsPerAuthority[0]
                      .values[0]
                      .value
                      .id;
    let speech;

    if(quality === "good") {
      speech = "Let's keep the great sleep going!";
    } else if (quality === "bad") {
      speech = "I hope tonight's better for you.";
    } else {
      speech = "I've got a good feeling about your sleep tonight.";
    }

    this.emit(':tell', speech);
  },
  GoingToBedIntent () {
    this.attributes.sleepStart = new Date();
    this.attributes.timesRisen = 0;

    this.emit(":tell", "Sleep well and let me know when you're awake.");

  },
  WakingUpIntent () {
    if(this.attributes.sleepStart) {
      this.handler.state = states.WAKING;
      this.attributes.timesRisen = this.attributes.timesRisen + 1;

      const response = "Are you up for good?";
      const reprompt = "Should I stop the sleep timer?";

      this.emit(":ask", response, reprompt);
    } else {
      this.emit(":tell", "Oops, by my measure you were already awake.");
    }
  },
  "AMAZON.StopIntent" () {
    if(this.attributes.sleepStart) {
      this.handler.state = states.WAKING;
      this.emitWithState("AMAZON.StopIntent");
    } else {
      this.emit(":tell", "Alright, see you around and sleep well.");
    }
  },
  "AMAZON.HelpIntent" () {
    const response = "You can ask Sleep Tracker how well rested you'll be or " +
                     "share how well you slept the night before. Try saying " +
                     "'I slept well last night.'";
    const reprompt = "You can also say, 'How well rested will I be sleeping " +
                     "8 hours.'";

    this.emit(":ask", response, reprompt);
  },
  "AMAZON.CancelIntent" () {
    this.emitWithState("AMAZON.StopIntent");
  },
  LaunchRequest () {
    if(this.attributes.sleeping) {
      this.emitWithState("WakingUpIntent");
    }

    let hint;
    if(this.attributes.lastIntent === "WellRestedIntent") {
      hint = "tell me how well or poorly you slept last night";
    } else if (this.attributes.lastIntent === "SleepQualityIntent") {
      hint = "ask for how rested you'll be depending on how many hours " +
             "you'll sleep";
    } else {
      hint = "tell me your sleep quality or ask how well rested you'll be";
    }

    const response = "Welcome to the Sleep Tracker skill. You can ask " +
                     hint;
    const reprompt = "Try saying 'I slept well last night.'";

    this.emit(":ask", response, reprompt);
  },
  SessionEndedRequest () {
    this.emit(":saveState", true);
  }
};

const tooMuchHandlers = Alexa.CreateStateHandler(states.TOO_MUCH, {
  "AMAZON.YesIntent" () {
    const speech = "You may sleep too much and be tired, but rest well!";
    this.emit(":tell", speech);
  },
  "AMAZON.NoIntent" () {
    const speech = "How many hours of sleep do you want?";
    const reprompt = "I'm sorry, how many hours did you plan to sleep?";

    this.emit(":ask", speech, reprompt);
  },
  "AMAZON.StopIntent" () {
    this.handler.state = "";
    this.emitWithState("AMAZON.StopIntent");
  },
  "AMAZON.HelpIntent" () {
    const response = "Tell me if you really plan to sleep that much.";
    const reprompt = "That's a lot of sleep. Did I hear you right?";

    this.emit(":ask", response, reprompt);
  },
  "AMAZON.CancelIntent" () {
    this.handler.state = "";
    this.emitWithState("AMAZON.StopIntent");
  },
  WellRestedIntent () {
    this.handler.state = "";
    this.emitWithState("WellRestedIntent");
  },
  Unhandled () {
    const response = "I'm sorry, I didn't understand. Tell me if you plan to " +
                     "really sleep that much.";
    const prompt = "You really want to sleep a lot. Did I hear it right?";

    this.emit(":ask", response, prompt);
  },
  SessionEndedRequest () {
    this.emit(":saveState", true);
  }
});

const wakingHandlers = Alexa.CreateStateHandler(states.WAKING, {
  "AMAZON.YesIntent" () {
    const current = new Date();
    const past = new Date(this.attributes.sleepStart);
    const diff = Math.abs(current.getTime() - past.getTime()) / (1000 * 60 * 60);
    const hours = Math.floor(diff);
    const minutes = Math.round(60 * (diff - hours));
    const timesRisen = this.attributes.timesRisen;

    this.attributes.sleepStart = undefined;
    this.attributes.timesRisen = 0;

    let response = `You slept ${pluralize(hours, "hour", "hours")} and ${pluralize(minutes, "minute", "minutes")}.`;

    if(timesRisen > 1) {
      response += `You woke up ${pluralize(timesRisen, "time", "times")}`;
    }

    this.emit(":tell", response);
  },
  "AMAZON.NoIntent" () {
    this.emit(":tell", "Sleep well.");
  },
  "AMAZON.StopIntent" () {
    this.emitWithState("AMAZON.YesIntent");
  },
  "AMAZON.CancelIntent" () {
    this.emitWithState("AMAZON.NoIntent");
  },
  Unhandled () {
    const prompt = "Would you like to wake up for good?";
    const response = "Are you waking up for good?";

    this.emit(":ask", prompt, response);
  },
  SessionEndedRequest () {
    this.emit(":saveState", true);
  }
});

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = "";
  alexa.dynamoDBTableName = "SleepTracker";
  alexa.registerHandlers(handlers, tooMuchHandlers, wakingHandlers);
  alexa.execute();
};
