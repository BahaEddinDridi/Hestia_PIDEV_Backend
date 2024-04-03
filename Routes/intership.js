const express = require('express');
const router = express.Router();
const controllerIntership = require('../Controllers/controller.intership')


router.post('/AddIntership/:username', controllerIntership.AddIntership);



router.get('/getAllInternships', controllerIntership.getAllInternships);
router.get('/getAllIntershipsOpportDeadlinefinalized', controllerIntership.getInternshipsByRoleAndDeadline);
router.get('/getAllFuturIntershipsOpport', controllerIntership.getFutureInternshipsByRole);
router.delete('/deleteIntership/:username/:id', controllerIntership.deleteInternshipByIdAndUsername);
router.get('/getInternshipById/:internshipId', controllerIntership.getInternshipById)


router.put('/UpdateInternship/:interId', controllerIntership.UpdateInternship);

module.exports = router;