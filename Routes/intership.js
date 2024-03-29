const express = require('express');
const router = express.Router();
const controllerIntership = require('../Controllers/controller.intership')


router.post('/AddIntership/:username', controllerIntership.AddIntership);



router.get('/getAllInternships', controllerIntership.getAllInternships);
router.get('/searchInternships', controllerIntership.searchInternships);
router.get('/getInterById/:internId', controllerIntership.getInterById);


router.put('/UpdateInter/:internId', controllerIntership.UpdateInter);
module.exports = router;