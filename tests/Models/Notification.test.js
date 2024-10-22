const mongoose = require('mongoose');
const Notification = require('../../Models/Notification');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const app = require('../../app'); // Assuming you have an Express app in app.js

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Notification Model Test', () => {
    it('create & save notification successfully', async () => {
        const validNotification = new Notification({
            recipientId: new mongoose.Types.ObjectId(),
            type: 'job_application',
            message: 'You have a new job application',
            jobId: new mongoose.Types.ObjectId(),
            applicantId: new mongoose.Types.ObjectId(),
        });
        const savedNotification = await validNotification.save();
        expect(savedNotification._id).toBeDefined();
        expect(savedNotification.recipientId).toBe(validNotification.recipientId);
        expect(savedNotification.type).toBe(validNotification.type);
        expect(savedNotification.message).toBe(validNotification.message);
        expect(savedNotification.jobId).toBe(validNotification.jobId);
        expect(savedNotification.applicantId).toBe(validNotification.applicantId);
        expect(savedNotification.timestamp).toBeDefined();
        expect(savedNotification.read).toBe(false);
    });

    it('insert notification successfully, but the field not defined in schema should be undefined', async () => {
        const notificationWithInvalidField = new Notification({
            recipientId: new mongoose.Types.ObjectId(),
            type: 'job_application',
            message: 'You have a new job application',
            jobId: new mongoose.Types.ObjectId(),
            applicantId: new mongoose.Types.ObjectId(),
            invalidField: 'should not be saved'
        });
        const savedNotification = await notificationWithInvalidField.save();
        expect(savedNotification._id).toBeDefined();
        expect(savedNotification.invalidField).toBeUndefined();
    });

    it('create notification without required field should fail', async () => {
        const notificationWithoutRequiredField = new Notification({ type: 'job_application' });
        let err;
        try {
            await notificationWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.recipientId).toBeDefined();
        expect(err.errors.message).toBeDefined();
    });
});