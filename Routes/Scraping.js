const express = require('express');
const router = express.Router();
const controllerCRM = require('../Controllers/controller.scrapper')
router.get('/scraper/:location/:keywords', controllerCRM.scrapLinkedin);
router.get('/scraper/skills', controllerCRM.extractSkillsFromJobs);
router.get('/scraper/topSkills', controllerCRM.topSkills);
router.get('/scraper/exportPDF', controllerCRM.exportPDF);
router.get('/scraper/exportExcel', controllerCRM.exportExcel);
router.get('/scraper/topLocations', controllerCRM.topLocations);
router.get('/scraper/topEmploymentType', controllerCRM.topEmploymentType);
router.get('/scraper/topCompanies', controllerCRM.topCompanies);
router.get('/scraper/topSeniorityLevel', controllerCRM.topSeniorityLevel);
module.exports = router;