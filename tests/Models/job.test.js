const mongoose = require('mongoose');
const Job = require('../../Models/job');
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

describe('Job Model Test', () => {
    it('should create & save job successfully', async () => {
        const validJob = new Job({
            jobCompanyId: new mongoose.Types.ObjectId(),
            jobCommpanyName: 'Test Company',
            jobTitle: 'Software Engineer',
            jobAdress: '123 Test St',
            jobLocation: 'Tunis',
            jobDescription: 'Job description here',
            salary: 5000,
            jobPost: 'Job post here',
            jobfield: 'Computer Science',
            jobStartDate: new Date(),
            jobApplicationDeadline: new Date(),
            jobRequiredSkills: ['JavaScript', 'Node.js'],
            jobRequiredEducation: 'Bachelor degree',
            jobRequiredExperience: 'Junior',
            contactNumber: 1234567890,
            jobOtherInformation: 'Other information here',
            jobApplications: [],
            jobImage: 'image.jpg',
        });
        const savedJob = await validJob.save();
        expect(savedJob._id).toBeDefined();
        expect(savedJob.jobTitle).toBe(validJob.jobTitle);
        expect(savedJob.salary).toBe(validJob.salary);
    });

    it('should fail to create job without required fields', async () => {
        const invalidJob = new Job({
            jobTitle: 'Software Engineer',
        });
        let err;
        try {
            await invalidJob.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.jobCompanyId).toBeDefined();
    });

    it('should fetch all jobs', async () => {
        const response = await supertest(app).get('/jobs');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
});