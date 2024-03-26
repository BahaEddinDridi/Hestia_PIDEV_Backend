const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\S+@\S+\.\S+$/
    },
    phoneNumber: {
        type: String,
        required: false
    },
    motivationLetter: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    submitDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    applicantUsername: {
        type: String,
    },
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
