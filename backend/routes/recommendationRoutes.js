const express = require('express');
const getYouTubeRecommendations = require('../controller/recommendationsController'); 

const router = express.Router();

router.post('/recommendations', getYouTubeRecommendations);

module.exports = router;
