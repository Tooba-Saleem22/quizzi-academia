const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Setting = require('../models/Settings');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const setting = await Setting.findOne();
    const adminEmail = setting?.adminEmail;

    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: 'Admin email not found in settings.'
      });
    }

    const mailOptions = {
      from: email,
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully. We will get back to you shortly.'
    });

  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({
      success: false,
      message: 'There was an error sending the message.'
    });
  }
});

module.exports = router;
