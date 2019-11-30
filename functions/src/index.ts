import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import * as util from 'util';

const exec = util.promisify(require('child_process').exec);

process.env.DEBUG = 'dialogflow:debug';

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  async function weighPackage(agent) {
    const name = agent.parameters.name;
    const version = agent.parameters.version;

    const { stdout, stderr } = await exec(
      `npx download-size ${name}${version ? `@${version}` : ''}`
    );

    if (stdout) agent.add(stdout);
    if (stderr) agent.add(stderr);
  }

  const intentMap = new Map();

  intentMap.set('Weigh The Package', weighPackage);

  agent.handleRequest(intentMap).then(
    () => null,
    () => null
  );
});
