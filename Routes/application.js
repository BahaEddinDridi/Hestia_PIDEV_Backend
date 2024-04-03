const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/controller.application');

// Route to handle resume upload
router.post('/saveApplication', ApplicationController.saveApplication);
router.get('/getJobApplicationAvailable', ApplicationController.getAvailableJobsApplications);
router.get('/getJobApplicationNotAvailable', ApplicationController.getUnavailableJobsApplications);

router.post('/saveInternshipApplication', ApplicationController.saveInternshipApplication);

router.put('/updateApplication/:applicationId', ApplicationController.updateApplication);
router.put('/updateInternshipApplication/:applicationId', ApplicationController.updateInternshipApplication);

router.get('/getApplicationsByUsername/:username', ApplicationController.getApplicationsByUsername);

router.delete('/deleteApplication/:applicationId', ApplicationController.deleteApplication);
module.exports = router;
