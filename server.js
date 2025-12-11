

const app = require('./src/index');
const config = require('./src/config');

const PORT = config.PORT || 3000;
const NODE_ENV = config.NODE_ENV || 'development';

/**
 * Start the server
 */
const server = app.listen(PORT, () => {
  console.log(`🚀 Server mode on http://localhost:${PORT}`);
});



module.exports = server;
