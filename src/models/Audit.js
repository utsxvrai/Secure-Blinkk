// Audit Model - for audit logging
const { v4: uuidv4 } = require('uuid');

class Audit {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.organizationId = data.organizationId;
    this.action = data.action;
    this.resource = data.resource;
    this.details = data.details || {};
    this.timestamp = data.timestamp || new Date().toISOString();
    this.ipAddress = data.ipAddress || 'N/A';
    this.userAgent = data.userAgent || 'N/A';
  }
}

module.exports = Audit;
