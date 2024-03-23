const express = require('express');
const router = express.Router();
const controllerIntership = require('../Controllers/controller.intership')


router.post('/AddIntership/:username', controllerIntership.AddIntership);

module.exports = router;