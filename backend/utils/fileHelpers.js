const fs = require('fs').promises;
const path = require('path');
const defaultSettings = require('../models/Settings');

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

async function ensureDataDirectory() {
  try {
    await fs.access(path.join(__dirname, '..', 'data'));
  } catch {
    await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
  }
}

async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    await writeSettings(defaultSettings);
    return defaultSettings;
  }
}

async function writeSettings(settings) {
  await ensureDataDirectory();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = {
  readSettings,
  writeSettings,
  SETTINGS_FILE
};
