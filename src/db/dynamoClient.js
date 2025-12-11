const AWS = require('aws-sdk');

/**
 * DynamoDB Client Configuration
 * Supports both local development (with DynamoDB Local via Docker)
 * and production (AWS DynamoDB)
 */

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
};

// Only set endpoint for local development
if (process.env.DYNAMODB_ENDPOINT) {
  config.endpoint = process.env.DYNAMODB_ENDPOINT;
}

// Set credentials for local development
if (process.env.NODE_ENV === 'development') {
  AWS.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });
}

const dynamoDB = new AWS.DynamoDB.DocumentClient(config);

console.log(`[DynamoDB] Initialized in ${process.env.NODE_ENV || 'development'} mode`);
if (process.env.DYNAMODB_ENDPOINT) {
  console.log(`[DynamoDB] Using local endpoint: ${process.env.DYNAMODB_ENDPOINT}`);
}

module.exports = dynamoDB;
