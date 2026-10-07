const Router = require('express').Router();
const dashboardController = require('../controller/dashboardController');

Router.get('/getDashboardData', dashboardController.getDashboardData);

module.exports = Router;