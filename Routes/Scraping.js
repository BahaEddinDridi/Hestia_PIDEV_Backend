const express = require('express');
const router = express.Router();
const controllerCRM = require('../Controllers/controller.scrapper')
router.get('/:location/:keywords', controllerCRM.scrapLinkedin);
module.exports = router;