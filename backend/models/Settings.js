const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  websiteName: { type: String, default: 'Quizzi Academi' },
  websiteTagline: { type: String, default: 'Learn and Grow' },
  websiteDescription: { type: String, default: '' },
  adminEmail: { type: String, default: 'admin@example.com' },
  supportEmail: { type: String, default: 'support@example.com' },
  contactInfo: {
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  aboutUs: {
    title: { type: String, default: 'About Us' },
    description: { type: String, default: '' },
    missionStatement: { type: String, default: '' },
    imageUrl: { type: String, default: '' }
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);