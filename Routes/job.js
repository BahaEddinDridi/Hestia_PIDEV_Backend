const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')


router.post('/AddJob/:username', controllerJob.AddJob);

module.exports = router;