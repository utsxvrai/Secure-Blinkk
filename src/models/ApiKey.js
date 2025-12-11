const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class ApiKey {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.organizationId = data.organizationId;
    this.name = data.name;
    this.keyHash = data.keyHash;
    this.keyPrefix = data.keyPrefix;
    this.lastUsed = data.lastUsed || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  static generateKey() {
    const key = 'sb_' + crypto.randomBytes(32).toString('hex');
    return key;
  }

  static generateKeyHash(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  static getKeyPrefix(key) {
    return key.substring(0, 7);
  }

  getPublicData() {
    return {
      id: this.id,
      name: this.name,
      keyPrefix: this.keyPrefix,
      lastUsed: this.lastUsed,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

module.exports = ApiKey;
