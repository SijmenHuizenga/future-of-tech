'use strict'

const AWS = require('aws-sdk');
const https = require('https');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function verifyRecapcha(recapchaResponseToken) {

  return doGetRequest(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPCHA_SERVER_TOKEN}&response=${recapchaResponseToken}`)
    .then((json) => {
      if (!json.success) {
        const errorCodes = json['error-codes'];
        const errorCodesList = Array.isArray(errorCodes) ? errorCodes.join(', ') : 'Unknown';
        console.log(json)
        throw `recaptcha failed with status: ${errorCodesList}`;
      }
      if(json.action !== 'submit') {
        console.log(json)
        throw `failed to verify recaptcha action (${json.action})`;
      }
      return json
    });
}

function storePrediction(id, prediction, author, capchaReport) {
  return ddb.putItem({
    TableName: 'Predictions',
    Item: {
      'UUID' : {S: id},
      'prediction': {S: prediction},
      'author': {S: author},
      'timestamp': {N: ''+Math.floor(new Date().getTime() / 1000)},
      'capcharScore': {N: ''+capchaReport.score}
    }
  }).promise();
}

exports.handler = function (event, context, callback) {
  if(event == null || !event.hasOwnProperty('body') || event["body"] == null) {
    callback(null, {
      statusCode: 400,
      body: 'no body',
    });
    return
  }

  if(Math.floor(new Date().getTime() / 1000) > 1610927940) {
    callback(null, {
      statusCode: 400,
      body: 'Submission deadline has passed.',
    });
  }

  let json;
  try {
    json = JSON.parse(event["body"]);
    if(json == null) {
      callback(null, {
        statusCode: 400,
        body: 'invalid json (null)',
      });
      return
    }
  } catch(e) {
    callback(null, {
      statusCode: 400,
      body: `invalid json (${e.message})`,
    });
    return
  }

  if(!json.hasOwnProperty('prediction')) {
    callback(null, {
      statusCode: 400,
      body: 'no prediction provided',
    });
    return
  }

  if(!json.hasOwnProperty('grecaptchatoken')) {
    callback(null, {
      statusCode: 400,
      body: 'no grecaptchatoken property provided',
    });
    return
  }

  if(json['prediction'].trim() === '') {
    callback(null, {
      statusCode: 400,
      body: 'prediction is empty',
    });
    return
  }

  verifyRecapcha(json['grecaptchatoken'])
      .then((capchaReport) => storePrediction(context.awsRequestId, json['prediction'], json.hasOwnProperty('author') ? json['author'] : '', capchaReport))
      .then(() =>
        callback(null, {
          statusCode: 200,
          headers: {},
          body: 'ok',
        })
      )
      .catch((e) => {
        console.log(e)
        callback(null, {statusCode: 500, body: 'error:' + e})
      });
};


function doGetRequest(url){
  return new Promise((resolve, reject) => {
    const req = https.request(url, {}, (res) => {
      if (res.statusCode !== 200) {
        console.log(res)
        return reject(`bad response code (${res.statusCode}) from recaptcha`)
      }

      let buffer = "";
      res.on('data', (chunk) => {
        buffer += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(buffer))
        } catch (e) {
          console.log(e, buffer)
          reject('failed parsing json from response from recaptcha: ' + e.message)
        }
      })

    });
    req.on('error', (e) => {
      console.log(e)
      reject('error from recaptcha request: ' + e.message);
    });
    req.end();
  });
}