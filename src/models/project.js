const { v4: uuidv4 } = require('uuid');

class Project {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.organizationId = data.organizationId;
    this.name = data.name;
    this.description = data.description || '';
    this.owner = data.owner;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  getPublicData() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      owner: this.owner,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Project;
