const mongoose = require('mongoose');
const Education = require('../../Models/Education');
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

describe('Education Model Test', () => {
    it('should create & save education successfully', async () => {
        const validEducation = new Education({
            school: 'Test School',
            degree: 'Test Degree',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2021-01-01'),
            description: 'Test Description'
        });
        const savedEducation = await validEducation.save();
        expect(savedEducation._id).toBeDefined();
        expect(savedEducation.school).toBe(validEducation.school);
        expect(savedEducation.degree).toBe(validEducation.degree);
        expect(savedEducation.startDate).toEqual(validEducation.startDate);
        expect(savedEducation.endDate).toEqual(validEducation.endDate);
        expect(savedEducation.description).toBe(validEducation.description);
    });

    it('should fail to create education without required fields', async () => {
        const invalidEducation = new Education({});
        let err;
        try {
            await invalidEducation.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});