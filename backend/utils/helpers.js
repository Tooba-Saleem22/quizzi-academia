const { v4: uuidv4 } = require('uuid');
exports.generatePaymentId = () => `pm_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

