const Router = require('express').Router();
const userController = require('../controller/userController');
const adminAuth = require('../middleware/adminAuth'); 
const auth = require('../middleware/auth');

Router.post('/create-admin',auth, adminAuth, userController.createAdmin);

Router.post('/register', userController.register);
Router.post('/login', userController.login);
Router.post('/logout', userController.logout);
Router.get('/refresh_token', userController.refreshToken);
Router.get('/recent', async (req, res) => {
    try {
      const users = await userSchema.find({})
        .sort({ createdAt: -1 }) 
        .limit(5) 
        .select('name'); 
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent users' });
    }
  });
  
  
  
module.exports = Router;