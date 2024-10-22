const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { AddJob, getAllJobs, searchJobs, getJobById, getappbyjobid, UpdateJob, getJobsByRoleAndDeadlinefinalized, getJobsByRoleAndFutureDeadline, deleteJobByIdAndUsername, AddJob1 } = require('../../Controllers/controller.job');
const Job = require('../../Models/job');
const User = require('../../Models/user');
const Notification = require('../../Models/Notification');

const app = express();
app.use(express.json());
app.post('/jobs/:username', AddJob);
app.get('/jobs', getAllJobs);
app.get('/jobs/search', searchJobs);
app.get('/jobs/:jobId', getJobById);
app.get('/jobs/applications/:jobId', getappbyjobid);
app.put('/jobs/:jobId', UpdateJob);
app.get('/jobs/role/:role/deadline/finalized', getJobsByRoleAndDeadlinefinalized);
app.get('/jobs/role/:role/deadline/future', getJobsByRoleAndFutureDeadline);
app.delete('/jobs/:id/:username', deleteJobByIdAndUsername);
app.post('/jobs1/:username', AddJob1);

describe('Job Controller', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe('AddJob', () => {
        it('should add a new job and update the user', async () => {
            const user = new User({ username: 'testuser', job: [] });
            await user.save();

            const jobData = {
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890'
            };

            const response = await request(app)
                .post(`/jobs/${user.username}`)
                .send(jobData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.job.length).toBe(1);
            expect(response.body.data.job[0].jobTitle).toBe(jobData.jobTitle);
        });
    });

    describe('getAllJobs', () => {
        it('should get all jobs with filters', async () => {
            const job = new Job({
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890'
            });
            await job.save();

            const response = await request(app)
                .get('/jobs')
                .query({ location: 'Test City', jobField: 'IT' });

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].jobTitle).toBe(job.jobTitle);
        });
    });

    describe('searchJobs', () => {
        it('should search jobs by query', async () => {
            const job = new Job({
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Search Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890'
            });
            await job.save();

            const response = await request(app)
                .get('/jobs/search')
                .query({ query: 'Search' });

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].jobTitle).toBe(job.jobTitle);
        });
    });

    describe('getJobById', () => {
        it('should get job by ID', async () => {
            const job = new Job({
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890'
            });
            await job.save();

            const response = await request(app)
                .get(`/jobs/${job._id}`);

            expect(response.status).toBe(200);
            expect(response.body.jobTitle).toBe(job.jobTitle);
        });
    });

    describe('getappbyjobid', () => {
        it('should get job applications by job ID', async () => {
            const job = new Job({
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890',
                jobApplications: [{ applicantName: 'John Doe', applicationDate: '2023-01-01' }]
            });
            await job.save();

            const response = await request(app)
                .get(`/jobs/applications/${job._id}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].applicantName).toBe('John Doe');
        });
    });

    describe('UpdateJob', () => {
        it('should update job by ID', async () => {
            const job = new Job({
                jobCompanyId: '123',
                jobCommpanyName: 'Test Company',
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post',
                jobImage: 'test.jpg',
                contactNumber: '1234567890'
            });
            await job.save();

            const updatedData = {
                jobTitle: 'Updated Job'
            };

            const response = await request(app)
                .put(`/jobs/${job._id}`)
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.data.updatedJob.jobTitle).toBe(updatedData.jobTitle);
        });
    });

    describe('getJobsByRoleAndDeadlinefinalized', () => {
        it('should get jobs by role and finalized deadline', async () => {
            const user = new User({
                username: 'testuser',
                role: 'professional',
                job: [{
                    jobCompanyId: '123',
                    jobCommpanyName: 'Test Company',
                    jobTitle: 'Test Job',
                    jobAdress: '123 Test St',
                    jobLocation: 'Test City',
                    jobDescription: 'Test Description',
                    salary: 50000,
                    jobfield: 'IT',
                    jobStartDate: '2023-01-01',
                    jobApplicationDeadline: '2022-12-31',
                    jobRequiredSkills: ['Skill1', 'Skill2'],
                    jobRequiredEducation: 'Bachelor',
                    jobRequiredExperience: '2 years',
                    jobOtherInformation: 'None',
                    jobPost: 'Test Post',
                    jobImage: 'test.jpg',
                    contactNumber: '1234567890'
                }]
            });
            await user.save();

            const response = await request(app)
                .get(`/jobs/role/professional/deadline/finalized`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].jobs.length).toBe(1);
            expect(response.body[0].jobs[0].jobTitle).toBe('Test Job');
        });
    });

    describe('getJobsByRoleAndFutureDeadline', () => {
        it('should get jobs by role and future deadline', async () => {
            const user = new User({
                username: 'testuser',
                role: 'professional',
                job: [{
                    jobCompanyId: '123',
                    jobCommpanyName: 'Test Company',
                    jobTitle: 'Test Job',
                    jobAdress: '123 Test St',
                    jobLocation: 'Test City',
                    jobDescription: 'Test Description',
                    salary: 50000,
                    jobfield: 'IT',
                    jobStartDate: '2023-01-01',
                    jobApplicationDeadline: '2023-12-31',
                    jobRequiredSkills: ['Skill1', 'Skill2'],
                    jobRequiredEducation: 'Bachelor',
                    jobRequiredExperience: '2 years',
                    jobOtherInformation: 'None',
                    jobPost: 'Test Post',
                    jobImage: 'test.jpg',
                    contactNumber: '1234567890'
                }]
            });
            await user.save();

            const response = await request(app)
                .get(`/jobs/role/professional/deadline/future`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].jobs.length).toBe(1);
            expect(response.body[0].jobs[0].jobTitle).toBe('Test Job');
        });
    });

    describe('deleteJobByIdAndUsername', () => {
        it('should delete job by ID and username', async () => {
            const user = new User({
                username: 'testuser',
                job: [{
                    jobCompanyId: '123',
                    jobCommpanyName: 'Test Company',
                    jobTitle: 'Test Job',
                    jobAdress: '123 Test St',
                    jobLocation: 'Test City',
                    jobDescription: 'Test Description',
                    salary: 50000,
                    jobfield: 'IT',
                    jobStartDate: '2023-01-01',
                    jobApplicationDeadline: '2023-12-31',
                    jobRequiredSkills: ['Skill1', 'Skill2'],
                    jobRequiredEducation: 'Bachelor',
                    jobRequiredExperience: '2 years',
                    jobOtherInformation: 'None',
                    jobPost: 'Test Post',
                    jobImage: 'test.jpg',
                    contactNumber: '1234567890'
                }]
            });
            await user.save();

            const jobId = user.job[0]._id;

            const response = await request(app)
                .delete(`/jobs/${jobId}/${user.username}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Job deleted successfully');
        });
    });

    describe('AddJob1', () => {
        it('should add a new job and update the user', async () => {
            const user = new User({ username: 'testuser', job: [] });
            await user.save();

            const jobData = {
                jobTitle: 'Test Job',
                jobAdress: '123 Test St',
                jobLocation: 'Test City',
                jobDescription: 'Test Description',
                salary: 50000,
                jobfield: 'IT',
                jobStartDate: '2023-01-01',
                jobApplicationDeadline: '2023-12-31',
                jobRequiredSkills: ['Skill1', 'Skill2'],
                jobRequiredEducation: 'Bachelor',
                jobRequiredExperience: '2 years',
                jobOtherInformation: 'None',
                jobPost: 'Test Post'
            };

            const response = await request(app)
                .post(`/jobs1/${user.username}`)
                .send(jobData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.jobTitle).toBe(jobData.jobTitle);
        });
    });
});