const mongoose = require('mongoose');
const Application = require('../../Models/Application');
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

describe('Application Model Test', () => {
    it('should throw validation error if required fields are missing', async () => {
        const application = new Application({});

        let err;
        try {
            await application.validate();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.fullName).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.motivationLetter).toBeDefined();
    });

    it('should save successfully if all required fields are provided', async () => {
        const validApplication = new Application({
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            motivationLetter: 'I am very motivated.',
        });

        let savedApplication;
        try {
            savedApplication = await validApplication.save();
        } catch (error) {
            console.error(error);
        }

        expect(savedApplication).toBeDefined();
        expect(savedApplication.fullName).toBe('John Doe');
        expect(savedApplication.email).toBe('john.doe@example.com');
        expect(savedApplication.motivationLetter).toBe('I am very motivated.');
    });

    it('should not save if email format is invalid', async () => {
        const invalidEmailApplication = new Application({
            fullName: 'Jane Doe',
            email: 'jane.doe@invalid',
            motivationLetter: 'I am very motivated.',
        });

        let err;
        try {
            await invalidEmailApplication.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });
});