const mongoose = require('mongoose');
const Application = require("./Application");
const skills = require("../skill/skills.json")
const skillsList = skills.skills.map(skill => skill);

const jobSchema = new mongoose.Schema({
    jobCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    jobCommpanyName: {
        type: String,
    },
    jobTitle : {
        type: String,
    },
    jobAdress : {
        type: String,
    },
    jobLocation : {
        type: String,
        enum: ["Ariana","Beja","Ben Arous","Bizerte","Gabes","Gafsa","Jendouba","Kairouan","Kasserine","Kebili","Kef","Mahdia","Manouba","Medenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan","Other"],      
    },
    jobDescription : {
        type: String,
    },
    salary: {
        type: Number,
        min: 0,
    },
    jobPost : {
        type: String,
    },
    jobfield: {
        type: String,
        enum: ['Computer Science', 'Mechanical Engineering','Electromechanical Engineering','Civil Engineering','Business'],
    },
    jobStartDate: {
        type: Date,
    },
    jobApplicationDeadline: {
        type: Date,
    },
    jobRequiredSkills: {
        type: [String],
        enum: skillsList, // Utilisation de la liste de compétences convertie
    },
    jobRequiredEducation: {
        type: String,
        enum: ['Bachelor degree', 'Engineering degree'],
    },
    jobRequiredExperience: {
        type: String,
        enum: ['Junior', 'Senior','Experienced'],
    },
    contactNumber: {
        type: Number,
    },
    jobOtherInformation: {
        type: String,
    },
    jobApplications: [Application.schema],
    jobImage:{
        type: String,
    },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;