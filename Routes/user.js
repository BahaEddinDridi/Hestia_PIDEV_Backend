const express = require('express');
const passport = require('../Config/passport');
const userController = require('../Controllers/controller.user');
const router = express.Router();
const verifyJWT = require('../Middlewares/verifyJWT')
const educationController=require('../Controllers/controller.education');
const experienceController=require('../Controllers/controller.experience');
const projectcontroller=require('../Controllers/controller.project');




router.post('/register', userController.registerUser);
router.put('/profile/update/:username',userController.updateprofile);
router.get('/profiles/:username',verifyJWT ,userController.getinfouser);
router.post('/upload-image',userController.uploadimage);
router.post('/upload-coverimage',userController.uploadcoverimage);
router.get('/Otherprofiles/:username' ,userController.getinfouser);

//education user
router.post('/neweducation/:username',educationController.AddEducation);
router.delete('/deleteeducation/:username/:educationId',educationController.DeleteEducation)
//experience user
router.post('/newexperience/:username',experienceController.AddExperience);
//project user
router.post('/newproject/:username',projectcontroller.Addproject);
router.post('/deactivateAccoun',userController.deactivatedaccount);
router.post('/image' ,userController.getimagbyapp);
//delete experience 
router.delete('/deleteExperiences/:username/:experienceId',experienceController.DeleteExperience);
//update experience
router.put('/updateExperiences/:username/:experienceId',experienceController.UpdateExperience);
//get all Experiences
router.get('/Experiences/:username', experienceController.getAllExperiences);
//delete education 
router.delete('/deleteEducation/:username/:educationId',educationController.DeleteEducationOmayma);
//update education 
router.put('/updateEducation/:username/:educationId',educationController.updateEducation);
//get all Educations 
router.get('/educations/:username',educationController.getAllEducations);

router.delete('/deleteproject/:username/:projectId',projectcontroller.Deleteproject);
router.get('/projects/:username',projectcontroller.getAllproject);
router.put('/updateproject/:username/:projectId',projectcontroller.Updateproject);
module.exports = router;
