'use strict'

var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function verifyRecapcha(recapchaResponseToken) {
  const requestOptions = {
    url: 'https://www.google.com/recaptcha/api/siteverify',
    form: {secret: process.env.RECAPCHA_SERVER_TOKEN, response: recapchaResponseToken},
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.post(requestOptions, (error, response, body) => {
      if (error) {
        return reject(error)
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Bad response code: ${response.statusCode}`))
      }

      if (!body.success) {
        const errorCodes = body['error-codes'];
        const errorCodesList = Array.isArray(errorCodes) ? errorCodes.join(', ') : 'Unknown';
        return reject(new Error(`Failed to verify: ${errorCodesList}`));
      }

      if(body.action !== 'submit') {
        return reject(new Error(`Failed to verify recaptcha action`));
      }

      return resolve(null, body)
    })
  });
}

function storePrediction(json, capchaReport) {
  return ddb.putItem({
    TableName: 'Predictions',
    Item: {
      'UUID' : {S: context.awsRequestId},
      'prediction': {S: json['prediction']},
      'author': {S: json.hasOwnProperty('author') ? json['author'] : ''},
      'timestamp': {N: ''+Math.floor(new Date().getTime() / 1000)},
      'capcharScore': {N: capchaReport.score}
    }
  }).promise();
}

exports.handler = function (event, context, callback) {
  if(event == null || !event.hasOwnProperty('body') || event["body"] == null) {
    callback(null, {
      statusCode: 400,
      body: 'error: cmon, we are just trying to do something nice. Please dont try to break it.',
    });
    return
  }

  let json;
  try {
    json = JSON.parse(event["body"]);
    if(json == null) {
      callback(null, {
        statusCode: 400,
        body: 'error: json is not',
      });
      return
    }
  } catch(e) {
    callback(null, {
      statusCode: 400,
      body: 'error: invalid json',
    });
    return
  }

  if(!json.hasOwnProperty('prediction')) {
    callback(null, {
      statusCode: 400,
      body: 'error: no prediction found',
    });
    return
  }

  if(!json.hasOwnProperty('grecaptchatoken')) {
    callback(null, {
      statusCode: 400,
      body: 'error: could you not try to break it please?',
    });
    return
  }

  verifyRecapcha(json['grecaptchatoken'])
      .then((capchaReport) => storePrediction(json, capchaReport))
      .then(() =>
        callback(null, {
          statusCode: 200,
          headers: {},
          body: 'ok',
        })
      )
      .catch((e) => {
        callback(null, {statusCode: 500, body: 'error:' + JSON.stringify(e)})
      });
};