require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToMongo = require('./db/db.js');
const dashboardRoutes = require('./routes/dashboardRoutes');
const courses = require('./routes/courses');
const modules = require('./routes/modules');
const errorHandler = require('./middleware/errorHandler');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const aiRoutes = require('./routes/ai');
const aimRoutes = require('./routes/aim');

const app = express();

connectToMongo();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



app.use("/api/user", require("./routes/userRoutes"));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/payments', paymentRoutes);
const path = require('path');
app.use('/api/payment/receipt', express.static(path.join(__dirname, 'uploads/receipts')));
app.use('/api/contact', contactRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/modules', aimRoutes);
app.use('/api/courses', courses);
app.use('/api', modules);
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/user', require('./routes/userProfileRoutes'));
app.use('/uploads', express.static('uploads'));
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});
app.use('/api/admin', require('./routes/adminRoutes'));
console.log("JWT Secret:", process.env.JWT_ACCESS_SECRET);
// Test route
app.get('/', (req, res) => {
  res.send('Hello,Quizzi Academi Backend!');
});
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    openrouterConfigured: !!process.env.OPENROUTER_API_KEY
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`eLearning Server is running on port ${port}`);
});