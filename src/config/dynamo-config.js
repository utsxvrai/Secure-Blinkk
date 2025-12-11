const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION || 'ap-south-1',
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;
