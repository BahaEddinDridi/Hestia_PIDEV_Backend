const express = require('express');
const router = express.Router();
const NotificationController = require('../Controllers/controller.notification')

router.get('/getNotificationsByUser/:userId', NotificationController.getNotificationsByUserId);