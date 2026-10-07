const express = require('express');

const router = express.Router();
const settingsController = require('../controller/settingsController');
router.get('/', settingsController.getAllSettings);
router.put('/',  settingsController.updateAllSettings);
router.get('/:section', settingsController.getSettingsSection);
router.patch('/:section', settingsController.updateSettingsSection);
router.post('/reset', settingsController.resetSettings);

module.exports = router;
