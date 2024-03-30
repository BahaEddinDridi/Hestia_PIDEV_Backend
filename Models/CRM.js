const mongoose = require('mongoose');
const CRMschema = new mongoose.Schema({
    PrivacyPolicy: {
        type: String,
    },
    TermsOfService: {
        type: String,
    },
    Location: {
        type: String,
    },
    Email : {
        type: String,
    },
    PhoneNumber: {
        type: Number,
    },
    Description : {
        type: String,
    },
    CompanyName: {
        type: String,
    },
    CompanyLink: {
        type: String,
    },
    SocialMedia: {
        Facebook: {
            type: String,
        },
        Twitter: {
            type: String,
        },
        LinkedIn: {
            type: String,
        },
        Instagram: {
            type: String,
        }
    },
});
const CRM = mongoose.model('CRM', CRMschema);
module.exports = CRM;