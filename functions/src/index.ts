import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { exec } from 'child_process';

process.env.DEBUG = 'dialogflow:debug';

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  async function weighPackage(agent: WebhookClient) {
    const name = agent.parameters.name;
    const version = agent.parameters.version;

    exec(
      `npm view ${name}${version ? `@${version}` : ''} dist.unpackedSize`,
      (error, stdout, stderr) => {
        if (error) agent.add(error.message);

        if (stdout) {
          agent.add(
            `${parseFloat(
              (Math.round((parseFloat(stdout) / 1000) * 1000) / 1000).toFixed(2)
            )} KiB`
          );
        }

        if (stderr) agent.add(stderr);
      }
    );
  }

  const intentMap = new Map();

  intentMap.set('Weigh The Package', weighPackage);

  agent.handleRequest(intentMap).then(
    () => null,
    () => null
  );
});
