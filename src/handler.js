const serverless = require('serverless-http');
const app = require('./index');

module.exports.handler = serverless(app, {
  request(request, event, context) {
    request.context = context;
  },
});