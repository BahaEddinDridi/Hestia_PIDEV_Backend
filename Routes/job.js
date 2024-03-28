const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')


router.post('/AddJob/:username', controllerJob.AddJob);
router.get('/getAllJobsOpportDeadlinefinalized', controllerJob.getJobsByRoleAndDeadlinefinalized);
router.get('/getAllJobsOpportFutureDeadline', controllerJob.getJobsByRoleAndFutureDeadline);
router.delete('/deleteJob/:username/:id', controllerJob.deleteJobByIdAndUsername);
router.post('/AddJob1/:username', controllerJob.AddJob1);
module.exports = router;