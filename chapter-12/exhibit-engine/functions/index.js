const {actionssdk} = require('actions-on-google');
const functions = require('firebase-functions');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', (conv) => {
  const response = "Hey there! With Exhibit Engine, you can talk to other " +
                   "apps. Just say 'engage' and then what you wanna do. " +
                   "Like... engage calculator to add one plus one. " +
                   "Go ahead. I'm listening.";

  conv.ask(response);
});

const functionalities = {
  echo: {
    matchers: [
      {
        matcher: new RegExp(/(?:repeat|say)(?:ing)? (.+)/),
        name: "RepeaterCapability"
      },
      {
        matcher: new RegExp(/(?:count)(?:ing)?(?: )?(?:up)? to (\d+)/),
        name: "CounterCapability"
      }
    ],
    handlers: {
      RepeaterCapability (conv, slots) {
        return conv.close(slots[0]);
      },
      CounterCapability (conv, slots) {
        let str = "";
        let num = parseInt(slots[0]);

        for (let i = 1; inum; i++) {
          str += `${i}.`
        }

        return conv.close(str);
      }
    }
  },
  calculator: {
    matchers: [
      {
        matcher: new RegExp(/(add|subtract|divide|multiply)(?:ing)? (\d+) (?:\D+) (\d+)/),
        name: "TwoNumberCapability"
      }
    ],
    handlers: {
      TwoNumberCapability (conv, slots) {
        const mathFormulae = {
          add (num1, num2) { return parseInt(num1) + parseInt(num2); },
          subtract (num1, num2) { return parseInt(num2) - parseInt(num1); },
          divide (num1, num2) { return parseInt(num1) / parseInt(num2); },
          multiply (num1, num2) { return parseInt(num1) * parseInt(num2); }
        };

        const [operator, num1, num2] = slots;
        const result = mathFormulae[operator](num1, num2);

        return conv.close(`The result is ${result}`);
      }
    }
  }
};

const functionalityMatcher = new RegExp(/engage (\w+) (?:to|and|for|with)/);

app.intent("actions.intent.TEXT", handler);

function handler (conv, input) {
  const match = input.match(functionalityMatcher);

  if (match) {
    const functionalityName = match[1];
    const functionality = functionalities[functionalityName];

    if (functionality) {
      const capability = functionality.matchers.find(capabilityObj => {
        return input.match(capabilityObj.matcher);
      });

      if (capability) {
        const capabilityName = capability.name;

        const handler = functionality.handlers[capabilityName];
        const slotValues = input.match(capability.matcher).slice(1);

        return handler(conv, slotValues);
      }
    }

    return conv.close("Well, this is awkward. I can't engage that one.");
  } else {
    const response = "Hey, I don't understand. Quick tip. " +
                     "You need to say 'engage' and then what you want. " +
                     "What'll it be?";
    return conv.ask(response);
  }
}

exports.exhibitEngineApp = functions.https.onRequest(app);
