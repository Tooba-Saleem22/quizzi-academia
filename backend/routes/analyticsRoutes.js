const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/userSchema');

const PaymentVerification = require('../models/PaymentVerification');

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get('/dashboard', async (req, res) => {
  try {
    const totalCourse = await Course.countDocuments();
    const totalQuiz = await Quiz.countDocuments();
    const totalUsers = await User.countDocuments();

    const monthlySalesData = await PaymentVerification.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$paymentAmount" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const entry = monthlySalesData.find(m => m._id.month === i + 1);
      return {
        month: monthNames[i],
        total: entry ? entry.total : 0
      };
    });

    res.json({
      metrics: {
        totalCourse,
        totalQuiz,
        totalUsers
      },
      monthlySales
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
