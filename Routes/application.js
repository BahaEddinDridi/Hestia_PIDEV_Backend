const express = require('express');
const router = express.Router();
const ApplicationController =require('../Controllers/controller.application');

// Route to handle resume upload
router.post('/saveApplication', ApplicationController.saveApplication);
router.post('/saveInternshipApplication', ApplicationController.saveInternshipApplication);

router.put('/updateApplication/:applicationId', ApplicationController.updateApplication);
router.put('/updateInternshipApplication/:applicationId', ApplicationController.updateInternshipApplication);

router.get('/getApplicationsByUsername/:username', ApplicationController.getApplicationsByUsername);

router.delete('/deleteApplication/:applicationId', ApplicationController.deleteApplication);
router.put('/updatestatus', ApplicationController.updateApplicationStatus);
router.put('/updatestatusinter', ApplicationController.updatestatuinter);
module.exports = router;
