const {actionssdk} = require("actions-on-google");
const functions = require("firebase-functions");

const app = actionssdk({debug: true});

app.intent("exhibitEngine.HELP", (conv) => {
  const response = "Help is what I'm here for. " + 
                   "Exhibit Engine has a couple apps. Calculator will " +
                   "calculate two numbers. Echo will repeat what you say. " +
                   "You can try it by saying something like, 'engage echo " +
                   "to repeat well, that just beats all.'";
  
  conv.close(response);
});

app.intent("actions.intent.MAIN", (conv) => {
  const response = "Hey there! With Exhibit Engine, you can talk to other " +
                   "apps. Just say 'engage' and then what you wanna do. " +
                   "Like... engage calculator to add one plus one. " +
                   "Go ahead. I'm listening.";
  
  conv.ask(response);
});

exports.exhibitEngineApp = functions.https.onRequest(app);