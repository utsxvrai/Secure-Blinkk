const apikeyService = require('../services/apikey-service');
const { AuthenticationError } = require('../utils/errors');
const { logAction } = require('../utils/audit');

const apikeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new AuthenticationError('API key is required');
    }

    // Verify API key
    const apiKeyData = await apikeyService.verifyApiKey(apiKey, req.body?.organizationId || req.query?.organizationId);

    // Attach API key info to request
    req.apiKey = {
      id: apiKeyData.id,
      organizationId: apiKeyData.organizationId,
      name: apiKeyData.name,
    };

    // Log audit
    await logAction(null, apiKeyData.organizationId, 'API_KEY_USED', 'ApiKey', {
      keyId: apiKeyData.id,
      endpoint: req.path,
      method: req.method,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    next();
  } catch (error) {
    next(new AuthenticationError('Invalid API key'));
  }
};

module.exports = apikeyAuth;
