const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { AddIntership, getAllInternships, searchInternships, UpdateInternship, getInternshipsByRoleAndDeadline, getFutureInternshipsByRole, deleteInternshipByIdAndUsername, getInternshipById, getappbyintershipid } = require('../../Controllers/controller.intership');
const User = require('../../Models/user');
const Intership = require('../../Models/internship');
const Notification = require('../../Models/Notification');

const app = express();
app.use(express.json());

app.post('/internship/:username', AddIntership);
app.get('/internships', getAllInternships);
app.get('/internships/search', searchInternships);
app.put('/internship/:interId', UpdateInternship);
app.get('/internships/role/:role/deadline', getInternshipsByRoleAndDeadline);
app.get('/internships/role/:role/future', getFutureInternshipsByRole);
app.delete('/internship/:username/:id', deleteInternshipByIdAndUsername);
app.get('/internship/:internshipId', getInternshipById);
app.get('/internship/:intershipid/applications', getappbyintershipid);

describe('Internship Controller', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    it('should add a new internship', async () => {
        const user = new User({ username: 'testuser', role: 'professional' });
        await user.save();

        const response = await request(app)
            .post('/internship/testuser')
            .send({
                interCompanyId: '123',
                interCommpanyName: 'Test Company',
                interTitle: 'Test Internship',
                interType: 'Full-time',
                interAdress: '123 Test St',
                interLocation: 'Test City',
                interDescription: 'Test Description',
                interPost: 'Test Post',
                interfield: 'Test Field',
                interStartDate: '2023-01-01',
                interApplicationDeadline: '2023-12-31',
                interRequiredSkills: 'Test Skills',
                interRequiredEducation: 'Test Education',
                contactNumber: '1234567890',
                interOtherInformation: 'Test Information',
                interImage: 'test.jpg'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should get all internships', async () => {
        const response = await request(app).get('/internships');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search internships', async () => {
        const response = await request(app).get('/internships/search?query=test');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update an internship', async () => {
        const internship = new Intership({ interTitle: 'Old Title' });
        await internship.save();

        const response = await request(app)
            .put(`/internship/${internship._id}`)
            .send({ interTitle: 'New Title' });

        expect(response.status).toBe(200);
        expect(response.body.data.updatedInternship.interTitle).toBe('New Title');
    });

    it('should get internships by role and deadline', async () => {
        const response = await request(app).get('/internships/role/professional/deadline');
        expect(response.status).toBe(200);
    });

    it('should get future internships by role', async () => {
        const response = await request(app).get('/internships/role/professional/future');
        expect(response.status).toBe(200);
    });

    it('should delete an internship by id and username', async () => {
        const user = new User({ username: 'testuser', role: 'professional', intership: [] });
        const internship = new Intership({ interTitle: 'Test Internship' });
        await internship.save();
        user.intership.push(internship);
        await user.save();

        const response = await request(app).delete(`/internship/testuser/${internship._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Internship deleted successfully');
    });

    it('should get an internship by id', async () => {
        const internship = new Intership({ interTitle: 'Test Internship' });
        await internship.save();

        const response = await request(app).get(`/internship/${internship._id}`);
        expect(response.status).toBe(200);
        expect(response.body.interTitle).toBe('Test Internship');
    });

    it('should get applications by internship id', async () => {
        const internship = new Intership({ interTitle: 'Test Internship', internshipApplications: [] });
        await internship.save();

        const response = await request(app).get(`/internship/${internship._id}/applications`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});