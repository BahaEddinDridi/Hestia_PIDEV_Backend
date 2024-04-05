const express = require('express');
const {getNotificationsByUserId} = require("../Controllers/controller.notification");
const router = express.Router();



router.get('/getNotificationsByUser/:userId', getNotificationsByUserId);

module.exports = router;