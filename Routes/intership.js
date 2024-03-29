const express = require('express');
const router = express.Router();
const controllerIntership = require('../Controllers/controller.intership')


router.post('/AddIntership/:username', controllerIntership.AddIntership);
router.get('/getAllInternships', controllerIntership.getAllInternships);
router.get('/searchInternships', controllerIntership.searchInternships);router.post('/AddIntership1/:username', controllerIntership.AddIntership1);
router.get('/getAllIntershipsOpportDeadlinefinalized', controllerIntership.getInternshipsByRoleAndDeadline);
router.get('/getAllFuturIntershipsOpport', controllerIntership.getFutureInternshipsByRole);
router.delete('/deleteIntership/:username/:id', controllerIntership.deleteInternshipByIdAndUsername);

module.exports = router;