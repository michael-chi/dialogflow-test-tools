## Demo Script

1. Configure Service Account with `Dialogflow API Cliwnt` role in IAM

2. Generate and Download Service Account Key file and name it `key.json`

3. Copy `key.json` to sample code root folder

4. Update `projectId` in `detectIntent.js` and `streamingDetectIntent.js`

5. Run `npm install`

6. To test DetectIntent with Audio Output, run

```shell
node detectIntent
```

7. To test StreamingDetectIntent with Audio Input and output, run

```shell
node streamingDetectIntent
```