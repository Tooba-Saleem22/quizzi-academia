const Settings = require('../models/Settings');

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

exports.updateAllSettings = async (req, res) => {
  try {
    let settings = await getOrCreateSettings();
    settings.set(req.body);
    await settings.save();
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

exports.getSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await getOrCreateSettings();

    if (settings[section]) {
      res.json({ success: true, data: settings[section] });
    } else {
      res.status(404).json({ success: false, error: 'Section not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch section' });
  }
};

exports.updateSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;
    let settings = await getOrCreateSettings();

    settings[section] = { ...settings[section], ...updates };
    await settings.save();

    res.json({ success: true, message: `${section} updated`, data: settings });
  } catch (error) { 
    res.status(500).json({ success: false, error: 'Failed to update section' });
  }
};

exports.resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = new Settings();
    await settings.save();
    res.json({ success: true, message: 'Settings reset', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reset settings' });
  }
};