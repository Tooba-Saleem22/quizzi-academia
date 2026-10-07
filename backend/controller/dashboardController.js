import Users from '../models/userSchema.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

export const getDashboardData = async (req, res) => {
  try {
    const totalUsers = await Users.countDocuments();
    const totalCourse = await Course.countDocuments();
    const totalQuiz = await Quiz.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);


    res.json({
      totalUsers,
      totalCourse,
      totalQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard data fetch failed" });
  }
};