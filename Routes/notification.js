const express = require('express');
const controllerNotifications = require("../Controllers/controller.notification");
const router = express.Router();



router.get('/getNotificationsByUser/:userId', controllerNotifications.getNotificationsByUserId);
router.post('/markNotificationsAsRead', controllerNotifications.markNotificationsAsRead);

module.exports = router;