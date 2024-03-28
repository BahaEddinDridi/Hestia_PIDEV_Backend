const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job');


router.post('/AddJob/:username', controllerJob.AddJob);
router.put('/UpdateJob/:jobId', controllerJob.UpdateJob);

router.get('/GetAllJobs', controllerJob.getAllJobs);
router.get('/searchJobs', controllerJob.searchJobs);
router.get('/getJobById/:jobId', controllerJob.getJobById);
module.exports = router;