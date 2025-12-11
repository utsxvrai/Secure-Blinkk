/**
 * DynamoDB Local Tables Initialization Script
 * Creates all necessary tables for local development
 * 
 * Usage: node scripts/init-tables.js
 */

require('dotenv').config({ path: '.env.local' });

const AWS = require('aws-sdk');

// Configure AWS SDK for local DynamoDB
const dynamodbConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
};

// Only set endpoint if DYNAMODB_ENDPOINT is explicitly provided
if (process.env.DYNAMODB_ENDPOINT) {
  dynamodbConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
} else {
  // Default to local for development
  dynamodbConfig.endpoint = 'http://localhost:8000';
}

console.log('🔧 DynamoDB Config:', { endpoint: dynamodbConfig.endpoint, region: dynamodbConfig.region });

AWS.config.update(dynamodbConfig);

const dynamodb = new AWS.DynamoDB(dynamodbConfig);

const tables = [
  {
    TableName: process.env.USERS_TABLE || 'users-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'organizationId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'emailOrganizationIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
          { AttributeName: 'organizationId', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'organizationIdIndex',
        KeySchema: [
          { AttributeName: 'organizationId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    TableName: process.env.PROJECTS_TABLE || 'projects-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'organizationId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'organizationIdIndex',
        KeySchema: [
          { AttributeName: 'organizationId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    TableName: process.env.API_KEYS_TABLE || 'api_keys-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'organizationId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' },
      { AttributeName: 'keyHash', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'organizationIdIndex',
        KeySchema: [
          { AttributeName: 'organizationId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'keyHashIndex',
        KeySchema: [
          { AttributeName: 'keyHash', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    TableName: process.env.AUDIT_TABLE || 'audit_logs-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'organizationId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'organizationIdTimestampIndex',
        KeySchema: [
          { AttributeName: 'organizationId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userIdTimestampIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    TableName: process.env.ORGANIZATIONS_TABLE || 'organizations-dev',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'nameIndex',
        KeySchema: [
          { AttributeName: 'name', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
];

/**
 * Create a single table
 */
async function createTable(tableConfig) {
  try {
    // Check if table exists
    const tables = await dynamodb.listTables().promise();
    
    if (tables.TableNames.includes(tableConfig.TableName)) {
      console.log(`⚠️ Table "${tableConfig.TableName}" already exists. Deleting...`);
      await dynamodb.deleteTable({ TableName: tableConfig.TableName }).promise();
      await waitForTableNotExists(tableConfig.TableName);
      console.log(`🗑️ Table "${tableConfig.TableName}" deleted.`);
    }

    // Create table
    await dynamodb.createTable(tableConfig).promise();
    console.log(`✨ Table "${tableConfig.TableName}" created successfully`);

    // Wait for table to be active
    await waitForTableActive(tableConfig.TableName);
  } catch (error) {
    console.error(`❌ Error creating table "${tableConfig.TableName}":`, error.message);
  }
}

/**
 * Wait for table to become active
 */
async function waitForTableActive(tableName, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await dynamodb.describeTable({ TableName: tableName }).promise();
      if (response.Table.TableStatus === 'ACTIVE') {
        console.log(`  ✓ Table "${tableName}" is now ACTIVE`);
        return;
      }
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error(`  ✗ Timeout waiting for table to be active`);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Wait for table to be deleted
 */
async function waitForTableNotExists(tableName, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await dynamodb.describeTable({ TableName: tableName }).promise();
      // If no error, table still exists, wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.code === 'ResourceNotFoundException') {
        return; // Table is gone
      }
      if (i === maxAttempts - 1) {
        console.error(`  ✗ Timeout waiting for table to be deleted`);
        throw error;
      }
    }
  }
}

/**
 * Initialize all tables
 */
async function initializeTables() {
  console.log(`
Connecting to DynamoDB at ${process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'}...
  `);

  // Check connection
  try {
    await dynamodb.listTables().promise();
    console.log('✅ Successfully connected to DynamoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to DynamoDB:', error.message);
    console.error('\nMake sure DynamoDB Local is running:');
    console.error('  npm run docker:up');
    process.exit(1);
  }

  // Create all tables
  console.log('Creating tables...\n');
  for (const tableConfig of tables) {
    await createTable(tableConfig);
  }

  console.log(`All tables have been created successfully!`);
}

// Run initialization
initializeTables().catch((error) => {
  console.error('❌ Initialization failed:', error);
  process.exit(1);
});
