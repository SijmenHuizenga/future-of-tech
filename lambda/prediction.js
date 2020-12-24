'use strict'

var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function (event, context, callback) {
  if(event == null || !event.hasOwnProperty('body') || event["body"] == null) {
    callback(null, {
      statusCode: 400,
      body: 'error: cmon, we are just trying to do something nice. Please dont try to break it.',
    })
    return
  }

  let json;
  try {
    json = JSON.parse(event["body"]);
    if(json == null) {
      callback(null, {
        statusCode: 400,
        body: 'error: json is not',
      })
      return
    }
  } catch(e) {
    callback(null, {
      statusCode: 400,
      body: 'error: invalid json',
    })
    return
  }

  if(!json.hasOwnProperty('prediction')) {
    callback(null, {
      statusCode: 400,
      body: 'error: no prediction found',
    })
    return
  }

  ddb.putItem({
    TableName: 'Predictions',
    Item: {
      'UUID' : {S: context.awsRequestId},
      'prediction': {S: json['prediction']},
      'author': {S: json.hasOwnProperty('author') ? json['author'] : ''},
      'timestamp': {N: ''+Math.floor(new Date().getTime() / 1000)},
    }
  }, (err, data) => {
    if (err) {
      callback(null, {
        statusCode: 500,
        body: 'error:' + JSON.stringify(err),
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {},
        body: 'ok',
      })
    }
  });
}