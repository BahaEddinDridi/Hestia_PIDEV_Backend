const express = require('express');
const router = express.Router();
const ProfileUpdaterController = require('../Controllers/controller.ProfileUpdater');


router.post('/CompareUserCv/:id', ProfileUpdaterController.CompareUserDataAndCV);
module.exports = router;