const uuid = require('uuid');
async function streamingDetectIntent(
    projectId,
    sessionId,
    filename,
    encoding,
    sampleRateHertz,
    languageCode
  ) {
    // [START dialogflow_detect_intent_streaming]
    const fs = require('fs');
    const util = require('util');
    const {Transform, pipeline} = require('stream');
    const {struct} = require('pb-util');
  
    const pump = util.promisify(pipeline);
    // Imports the Dialogflow library
    const dialogflow = require('@google-cloud/dialogflow');
  
    // Instantiates a session client
    const sessionClient = new dialogflow.v2beta1.SessionsClient({ keyFilename: '/home/michi/src/grpc/df-client/key.json' });
  
    // The path to the local file on which to perform speech recognition, e.g.
    // /path/to/audio.raw const filename = '/path/to/audio.raw';
  
    // The encoding of the audio file, e.g. 'AUDIO_ENCODING_LINEAR_16'
    // const encoding = 'AUDIO_ENCODING_LINEAR_16';
  
    // The sample rate of the audio file in hertz, e.g. 16000
    // const sampleRateHertz = 16000;
  
    // The BCP-47 language code to use, e.g. 'en-US'
    // const languageCode = 'en-US';
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    const initialStreamRequest = {
      session: sessionPath,
      queryInput: {
        // input_event:{
        //   name:'Welcome',
        //   parameters:{},
        //   language_code: languageCode
        // },
        audioConfig: {
          audioEncoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: languageCode,
        },
        singleUtterance: true,
        interimResults: false,
      },
      outputAudioConfig: {
        audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
        sampleRateHertz,
        synthesizeSpeechConfig: {
          speakingRate: 1,
          pitch: 5,
          volumeGainDb: -8,
          voice: {
            ssmlGender: 'SSML_VOICE_GENDER_FEMALE'
          }
        }
      },
    };
  
    // Create a stream for the streaming request.
    const detectStream = sessionClient
      .streamingDetectIntent()
      .on('error', console.error)
      .on('data', data => {
        if (data.recognitionResult) {
          console.log(
            `Intermediate transcript: ${data.recognitionResult.transcript}`
          );
        } else {
          console.log('Detected intent:');
  
          const result = data.queryResult;
          // Instantiates a context client
          const contextClient = new dialogflow.ContextsClient();
          //console.log(`  Response: ${result.fulfillmentText}`);
          util.promisify(fs.writeFile)(`/home/michi/src/grpc/df-client/${sessionId}-result.wav`, data.outputAudio, 'binary');
          console.log(JSON.stringify(data));
        }
      }
      );
  
    // Write the initial stream request to config for audio input.
    detectStream.write(initialStreamRequest);
  
    // Stream an audio file from disk to the Conversation API, e.g.
    // "./resources/audio.raw"
    await pump(
      fs.createReadStream(filename),
      // Format the audio stream into the request format.
      new Transform({
        objectMode: true,
        transform: (obj, _, next) => {
          next(null, {inputAudio: obj});
        },
      }),
      detectStream
    );
    // [END dialogflow_detect_intent_streaming]
  }
  

streamingDetectIntent('roaming-284203', uuid.v4(), '/home/michi/src/grpc/df-client/test2.wav','AUDIO_ENCODING_LINEAR_16',24000,'zh-TW');