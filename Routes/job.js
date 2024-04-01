const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')
const UpdateJob = require('../Controllers/controller.job').UpdateJob;


router.post('/AddJob/:username', controllerJob.AddJob);

router.put('/UpdateJob/:username/:jobId', controllerJob.UpdateJob);
router.get('/getAllJobsOpportDeadlinefinalized', controllerJob.getJobsByRoleAndDeadlinefinalized);
router.get('/getAllJobsOpportFutureDeadline', controllerJob.getJobsByRoleAndFutureDeadline);
router.delete('/deleteJob/:username/:id', controllerJob.deleteJobByIdAndUsername);
router.post('/AddJob1/:username', controllerJob.AddJob1);
router.get('/GetAllJobs', controllerJob.getAllJobs);
router.get('/searchJobs', controllerJob.searchJobs);
router.get('/getJobById/:jobId', controllerJob.getJobById);
router.get('/getapp/:jobId', controllerJob.getappbyjobid);
module.exports = router;