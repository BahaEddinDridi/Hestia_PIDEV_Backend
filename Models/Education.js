const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    school: {
        type: String,
    
    },
    degree: {
        type: String,
       
    },
    startDate: {
        type: Date,
       
    },
    endDate: {
        type: Date,
    },
    description: {
        type: String,
    },
});
const Education = mongoose.model('Education', educationSchema);

module.exports = Education;