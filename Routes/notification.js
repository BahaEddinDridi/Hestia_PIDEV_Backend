const express = require('express');
const controllerNotifications = require("../Controllers/controller.notification");
const router = express.Router();



router.get('/getNotificationsByUser/:userId', controllerNotifications.getNotificationsByUserId);
router.post('/markNotificationsAsRead', controllerNotifications.markNotificationsAsRead);
router.get('/Notifications_Counts/:userId',controllerNotifications.getNotificationsCountByUserId);
router.get('/NotificationsByDate/:userId',controllerNotifications.getNotificationsCountByUserIdByDate);

module.exports = router;