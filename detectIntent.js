const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const fs = require('fs');
const util = require('util');
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(projectId = '<PROJECT-ID>') {
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.v2beta1.SessionsClient({ keyFilename: './key.json' });
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: '你好',
                // The language used by the client (en-US)
                languageCode: 'zh-TW',
            },
        },
        outputAudioConfig: {
            audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
        },
    };
    sessionClient.streamingDetectIntent();
    sessionClient.detectIntent(request).then(responses => {
        console.log('Detected intent:');
        const audioFile = responses[0].outputAudio;
        console.log(JSON.stringify(responses[0]));
        util.promisify(fs.writeFile)(`./${sessionId}.wav`, audioFile, 'binary');
      });
}

runSample();