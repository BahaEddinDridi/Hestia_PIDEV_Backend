const mongoose = require('mongoose');
const Application = require("./Application");

const internshipSchema = new mongoose.Schema({
    interCompanyId : {
        type : String,
    },
    interCommpanyName : {
        type : String,
    },
    interTitle : {
        type: String,
    },
    interAdress : {
        type: String,
    },
    interLocation : {
        type: String,
        enum: ["Ariana","Beja","Ben Arous","Bizerte","Gabes","Gafsa","Jendouba","Kairouan","Kasserine","Kebili","Kef","Mahdia","Manouba","Medenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan","Other"],      
    },
    interDescription : {
        type: String,
    },
    interPost : {
        type: String,
    },
    interfield: {
        type: String,
        enum: ['Computer Science', 'Mechanical Engineering','Electromechanical Engineering','Civil Engineering','Business'],
    },
    interStartDate: {
        type: Date,
    },
    interApplicationDeadline: {
        type: Date,
    },
    interRequiredSkills: {
        type: String,
    },
    interRequiredEducation: {
        type: String,
        enum: ['Bachelor degree 1st year','Bachelor degree 2nd year','Bachelor degree 3rd year', 'Engineering degree 1st year', 'Engineering degree 2nd year', 'Engineering degree 3rd year',"PreEngineering 1st year","PreEngineering 2nd year"],
    },
    contactNumber: {
        type: Number,
    },
    interOtherInformation: {
        type: String,
    },
    interType: {
        type : String,
        enum: ['Summer Internship','PFE Internship'],
    },
    interImage:{
        type: String,
    },
    internshipApplications: [Application.schema],
});

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;