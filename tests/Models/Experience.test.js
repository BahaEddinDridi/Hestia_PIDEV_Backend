const mongoose = require('mongoose');
const Experience = require('../../Models/Experience');
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

describe('Experience Model Test', () => {
    it('should create & save an experience successfully', async () => {
        const validExperience = new Experience({
            title: 'Software Engineer',
            company: 'Tech Company',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2021-01-01'),
            description: 'Developed software solutions.'
        });
        const savedExperience = await validExperience.save();
        
        expect(savedExperience._id).toBeDefined();
        expect(savedExperience.title).toBe('Software Engineer');
        expect(savedExperience.company).toBe('Tech Company');
        expect(savedExperience.startDate).toEqual(new Date('2020-01-01'));
        expect(savedExperience.endDate).toEqual(new Date('2021-01-01'));
        expect(savedExperience.description).toBe('Developed software solutions.');
    });

    it('should fail to create an experience without required fields', async () => {
        const invalidExperience = new Experience({});
        let err;
        try {
            await invalidExperience.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.title).toBeDefined();
        expect(err.errors.company).toBeDefined();
    });
});