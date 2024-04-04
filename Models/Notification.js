const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['application', 'other'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
