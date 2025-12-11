const { ValidationError } = require('../utils/errors');

const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove unknown fields
      convert: true, // Try to convert values to the specified type
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(messages);
    }

    req.body = value; // Replace body with validated value
    next();
  };
};

const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs to prevent XSS
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
};

module.exports = {
  validateInput,
  sanitizeInput,
};
