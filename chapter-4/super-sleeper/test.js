const simulation = require("./simulation.json");
const request = simulation.result.skillExecutionInfo.invocationRequest.body;
const handler = require("./lambda/custom/index.js").handler;

handler(request, {}, (err, res) => {
  if (err) {
    console.log(`err ${err}`);
  } else {
    console.log(res);
  }
});
