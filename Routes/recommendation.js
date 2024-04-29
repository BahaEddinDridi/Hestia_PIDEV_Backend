const express = require('express');
const router = express.Router();
const recommendationController = require('../Controllers/controller.recommendation');

router.get('/recommendUser/:userId', recommendationController.recommendUser);
module.exports = router;
