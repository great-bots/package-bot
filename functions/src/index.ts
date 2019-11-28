import * as functions from "firebase-functions";
import { WebhookClient } from "dialogflow-fulfillment";

process.env.DEBUG = "dialogflow:debug";

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log("Dialogflow Request headers: " + JSON.stringify(request.headers));
  console.log("Dialogflow Request body: " + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function weighPackage(agent) {
    const name = agent.parameter.name;
    const version = agent.parameter.version;

    agent.add(`Weigh! ${name} ${version}`);
  }

  const intentMap = new Map();

  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("Weigh The Package", weighPackage);

  agent.handleRequest(intentMap);
});
