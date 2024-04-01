const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/controller.application');

// Route to handle resume upload
router.post('/saveApplication', ApplicationController.saveApplication);
router.post('/saveInternshipApplication', ApplicationController.saveInternshipApplication);

router.put('/updateApplication/:applicationId', ApplicationController.updateApplication);
router.put('/updateInternshipApplication/:applicationId', ApplicationController.updateInternshipApplication);

module.exports = router;
