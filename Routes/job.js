const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')


router.post('/AddJob/:username', controllerJob.AddJob);

router.get('/GetAllJobs', controllerJob.getAllJobs);
router.get('/searchJobs', controllerJob.searchJobs);
module.exports = router;