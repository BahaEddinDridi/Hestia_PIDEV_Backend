const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')
const UpdateJob = require('../Controllers/controller.job').UpdateJob;


router.post('/AddJob/:username', controllerJob.AddJob);
router.get('/getJobById/:id', controllerJob.getJobById);
router.put('/UpdateJob/:username/:jobId', controllerJob.UpdateJob);

router.get('/GetAllJobs', controllerJob.getAllJobs);
router.get('/searchJobs', controllerJob.searchJobs);
router.get('/getJobById/:jobId', controllerJob.getJobById);
module.exports = router;