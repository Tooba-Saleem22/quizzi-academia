const Router = require('express').Router()
const adminController = require('../controller/adminController')
const auth = require('../middleware/auth')

Router.get('/users', auth, adminController.getAllUsers)
Router.get('/user/:id', auth, adminController.getUserById)
Router.put('/user/:id', auth, adminController.updateUser)
Router.delete('/user/:id', auth, adminController.deleteUser)

Router.get('/', (req, res) => {
    res.send("Admin route active");
});

module.exports = Router; 