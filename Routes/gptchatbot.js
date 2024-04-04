const express = require('express');
const router = express.Router();
const controllerGptchatbot = require('../Controllers/controller.gptchatbot');

// Define the route with the user ID placeholder
router.post('/AddGptchatbot/:userID', controllerGptchatbot.main);
router.post('/UpdateUserDataFromCV/:userID', controllerGptchatbot.updateUserDataFromCV);

module.exports = router;
