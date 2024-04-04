const express = require('express');
const router = express.Router();
const controllerCRM = require('../Controllers/controller.crm')

router.post('/addCRM', controllerCRM.addCRM);
router.get('/getCRM', controllerCRM.getCRM);
router.put('/updateCRM', controllerCRM.updateCRM);
module.exports = router;
