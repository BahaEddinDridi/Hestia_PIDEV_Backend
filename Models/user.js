const mongoose = require('mongoose');
const Job = require('./job')
const Intership = require('./internship')
const {compare} = require("bcrypt");
const Experience = require('./Experience');
const Education = require('./Education');
const Project = require('./Project');
const bcrypt = require("bcrypt");
const Application = require("./Application");
const { resume } = require('pdfkit');

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: false,
    },
    lastName : {
        type: String,
        required: false,
    },
    birthDate : {
        type: Date,
        required: false,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
    },
    securityAnswers: [{
        type: String,
        required: false,
    }],
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ['admin', 'jobSeeker', 'professional', 'teacher'],
    },
    image:{
        type:String,
        required:false,
    },
    status:{
        type:String,
        enum:['online','offline'],
        default:'offline',
    },
    sexe: {
        type: String,
        enum: ['Homme', 'Femme'],
    },
   
    coverimage:{
        type:String,
        required:false,
    },
    status:{
        type:String,
        enum:['online','offline'],
        default:'offline',
    },
    location:{
        type:String,
    },
    phoneNumber:{
        type:String,
    },
    gender:{
        type:String,
        enum: ['female', 'male','other'],
        required: false,
    },
    ProfileStatus:{
        type:String,
        enum:['active','deactivated','pending','banned'],
        default:'active',
    },
    deactivationExpiresAt: {
        type: Date,
        default: null,
    },
    durationType: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: null,
    },
     loginAttempts: {
        type: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    recoveryEmail: {
        type: String,
        unique: true,
        lowercase: true,
    },
    title:{
        type:String,
    },
    CompanyLink: {
        type: String
    },
    Country: {
        type: String
    },
    accountVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    active: {
        type: Boolean,
        default: true,
    },
    deactivationEndTime: {
        type: Date,
        default: null,
    },
    resume: {
        type: String,
    },
    applications: [Application.schema],
    experience:[Experience.schema],
    education:[Education.schema],
    project:[Project.schema],
    job:[Job.schema],
    intership:[Intership.schema],
    skills: [String],
});

userSchema.methods.isValidPassword = async function (password) {
    try {
        return await compare(password, this.password);
    } catch (error) {
        throw error;
    }
};
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Internal Server Error');
  }
};
userSchema.methods.isAccountBlocked = function() {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at 00:00:00
    const failedAttemptsToday = this.loginAttempts.filter(attempt => {
        return new Date(attempt.timestamp).setHours(0, 0, 0, 0) === today;
    });

    return failedAttemptsToday.length >= 3;
};


userSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at 00:00:00
    const failedAttemptsToday = this.loginAttempts.filter(attempt => {
        return new Date(attempt.timestamp).setHours(0, 0, 0, 0) === today;
    });

    if (failedAttemptsToday.length >= 3) {
        const err = new Error('Account is blocked due to too many failed login attempts today');
        return next(err);
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
