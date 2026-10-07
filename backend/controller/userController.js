require('dotenv').config();
const Users = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      console.log("➡️ Request received with:", name, email, password);

      const user = await Users.findOne({ email });
      if (user) return res.status(400).json({ msg: "Email Already Exists." });

      if (password.length < 6)
        return res.status(400).json({ msg: "Password Is Too Short" });

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
        role: role || 0
      });

      await newUser.save();

      const accesstoken = createAccessToken({ id: newUser._id, role: newUser.role });
      const refreshtoken = createRefreshToken({ id: newUser._id, role: newUser.role });

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({ msg: "User Registered successfully", accesstoken });
    } catch (err) {
      console.error("Error in register:", err);
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, isAdmin } = req.body;
  
      const user = await Users.findOne({ email });
  
      if (!user)
        return res.status(400).json({ msg: "User does not exist." });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Incorrect password." });
  
      // Admin role check
      if (isAdmin && user.role !== 1) {
        return res.status(403).json({ msg: "Not an admin account." });
      }
  
      const accesstoken = createAccessToken({ id: user._id, role: user.role });
      const refreshtoken = createRefreshToken({ id: user._id, role: user.role });
  
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/api/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      return res.status(200).json({
        msg: isAdmin ? "Admin Logged In Successfully" : "Logged In Successfully",
        accesstoken,
        name: user.name,
        email: user.email,
        approved: user.approved || false // ✅ for quiz access
      });
  
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/api/user/refresh_token' });
      return res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please Login or Register" });

      jwt.verify(rf_token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please Login or Register" });

        const accesstoken = createAccessToken({ id: user.id });

        res.json({ accesstoken });
      });

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
createAdmin: async (req, res) => {
  try {
    if (req.user.role !== 1) {
      return res.status(403).json({ msg: "Only admins can create new admins." });
    }

    const { name, email, password } = req.body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists." });

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = new Users({
      name,
      email,
      password: passwordHash,
      role: 1 
    });

    await newAdmin.save();

    res.status(201).json({ msg: "Admin account created successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

  getRecentUsers: async (req, res) => {
    try {
      const recentUsers = await Users.find().sort({ createdAt: -1 }).limit(5);
      res.json(recentUsers);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

};

module.exports = userCtrl;
