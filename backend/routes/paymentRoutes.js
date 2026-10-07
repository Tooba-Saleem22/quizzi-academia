const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PaymentVerification = require('../models/PaymentVerification');
const User = require('../models/userSchema');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/submit-verification', upload.single('receipt'), async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      userPhone,
      transactionId,
      paymentAmount,
      easypaisaNumber
    } = req.body;

    if (!userEmail || !userPhone || !transactionId || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including receipt image'
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingVerification = await PaymentVerification.findOne({ transactionId });
    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: 'This transaction ID has already been used'
      });
    }

    const paymentVerification = new PaymentVerification({
      userEmail,
      userName: userName || user.name,
      userPhone,
      transactionId,
      paymentAmount: parseFloat(paymentAmount),
      easypaisaNumber,
      receiptPath: req.file.path,
      receiptOriginalName: req.file.originalname,
      status: 'pending',
      submittedAt: new Date()
    });

    await paymentVerification.save();

    res.json({
      success: true,
      message: 'Payment verification submitted successfully. Admin will review within 24 hours.',
      verificationId: paymentVerification._id
    });

  } catch (error) {
    console.error('Payment verification submission error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

router.get('/check-access', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ hasAccess: false, message: 'Email required' });
    }

    const approvedPayment = await PaymentVerification.findOne({
      userEmail: email,
      status: 'approved'
    }).sort({ approvedAt: -1 });

    if (!approvedPayment) {
      return res.json({ hasAccess: false });
    }

    const now = new Date();
    const accessExpires = new Date(approvedPayment.approvedAt);
    accessExpires.setDate(accessExpires.getDate() + 30);

    const hasAccess = now <= accessExpires;

    res.json({
      hasAccess,
      expiresOn: accessExpires.toISOString(),
      approvedAt: approvedPayment.approvedAt
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ hasAccess: false, message: 'Server error' });
  }
});

router.get('/admin/verifications', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const verifications = await PaymentVerification.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaymentVerification.countDocuments(query);

    res.json({
      success: true,
      data: verifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: verifications.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Admin verifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.patch('/admin/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const verification = await PaymentVerification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Payment verification not found'
      });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This verification has already been processed'
      });
    }

    verification.status = status;
    verification.adminNotes = adminNotes || '';
    verification.processedAt = new Date();

    if (status === 'approved') {
      verification.approvedAt = new Date();

      await User.findOneAndUpdate(
        { email: verification.userEmail },
        { approved: true }
      );
    }

    await verification.save();

    res.json({
      success: true,
      message: `Payment verification ${status} successfully`,
      data: verification
    });

  } catch (error) {
    console.error('Admin verification update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/receipt/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads/receipts', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({ message: 'Receipt not found' });
  }
});

module.exports = router;
