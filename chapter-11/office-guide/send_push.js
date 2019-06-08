const {google} = require("googleapis");
const request = require("request");
const util = require("util");
const key = "<PATH TO CREDS FILE>";

const endpoint = "https://www.googleapis.com/auth/actions.fulfillment.conversation";
const jwtClient = new google.auth.JWT(
  key.client_email, null, key.private_key,
  [endpoint],
  null
);

const pushNotification = {
  userNotification: {
    title: "New VUI Tip Coming In Hot",
  },
  target: {
    userId: "<UPDATES_USER_ID>",
    intent: "concept_application",
    locale: "en-US"
  },
};

const post = util.promisify(request.post);

jwtClient.authorize()
  .then(tokens => {
    return post("https://actions.googleapis.com/v2/conversations:send", {
      "auth": {
        "bearer": tokens.access_token,
      },
      "json": true,
      "body": {"customPushMessage": pushNotification},
    });
  })
  .then((res) => {console.log(res.statusCode);})
  .catch(console.error);
