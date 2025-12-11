#!/usr/bin/env node

/**
 * Quick Setup Script for Windows PowerShell
 * Usage: node scripts/quick-setup.js
 * 
 * This script automates the initial setup process
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class Setup {
  constructor() {
    this.isWindows = process.platform === 'win32';
    this.isLinux = process.platform === 'linux';
    this.isMac = process.platform === 'darwin';
  }

  log(message, type = 'info') {
    const icons = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      loading: '⏳',
    };
    console.log(`${icons[type]} ${message}`);
  }

  async checkDocker() {
    this.log('Checking Docker installation...', 'loading');
    return new Promise((resolve) => {
      const command = this.isWindows ? 'docker' : 'docker';
      const child = spawn(command, ['--version']);
      
      let hasDocker = false;
      child.on('close', (code) => {
        if (code === 0) {
          this.log('Docker is installed ✓', 'success');
          hasDocker = true;
        } else {
          this.log('Docker not found. Please install Docker Desktop', 'error');
        }
        resolve(hasDocker);
      });

      child.on('error', () => {
        this.log('Docker not found. Please install Docker Desktop', 'error');
        resolve(false);
      });
    });
  }

  async runCommand(command, args, description) {
    return new Promise((resolve, reject) => {
      this.log(description, 'loading');
      const child = spawn(command, args, { stdio: 'inherit', shell: true });
      
      child.on('close', (code) => {
        if (code === 0) {
          this.log(`${description} ✓`, 'success');
          resolve(true);
        } else {
          this.log(`${description} failed`, 'error');
          resolve(false);
        }
      });

      child.on('error', (err) => {
        this.log(`Error: ${err.message}`, 'error');
        resolve(false);
      });
    });
  }

  async run() {
  console.log(`Done`);

    // Check Docker
    const hasDocker = await this.checkDocker();
    if (!hasDocker) {
      this.log('Please install Docker Desktop and try again', 'error');
      process.exit(1);
    }

    // Check if .env.local exists
    if (!fs.existsSync('.env.local')) {
      this.log('Creating .env.local from .env.example...', 'loading');
      const example = fs.readFileSync('.env.example', 'utf8');
      fs.writeFileSync('.env.local', example);
      this.log('Created .env.local', 'success');
    }

    // Run npm install
    const npmInstalled = await this.runCommand('npm', ['install'], 'Installing dependencies');
    if (!npmInstalled) {
      this.log('npm install failed', 'error');
      process.exit(1);
    }

    // Start Docker
    const dockerStarted = await this.runCommand('npm', ['run', 'docker:up'], 'Starting Docker containers');
    if (!dockerStarted) {
      this.log('Docker startup failed', 'error');
      process.exit(1);
    }

    // Wait for DynamoDB to be ready
    this.log('Waiting for DynamoDB to be ready (30 seconds)...', 'loading');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Initialize tables
    const tablesInitialized = await this.runCommand('npm', ['run', 'init-tables'], 'Initializing DynamoDB tables');
    if (!tablesInitialized) {
      this.log('Table initialization failed', 'error');
      process.exit(1);
    }

    console.log(`
Next steps:

1. Start the development server:
   npm run dev

2. API will be available at:
   http://localhost:3000

3. DynamoDB Admin UI:
   http://localhost:8001

4. Test the API:
   curl http://localhost:3000/health

Happy Coding! 💻
    `);
  }
}

const setup = new Setup();
setup.run().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
