const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/controller.application');

// Route to handle resume upload
router.post('/saveApplication', ApplicationController.saveApplication);
router.get('/getJobApplicationAvailable', ApplicationController.getAvailableJobsApplications);
router.get('/getJobApplicationNotAvailable', ApplicationController.getUnavailableJobsApplications);


module.exports = router;
