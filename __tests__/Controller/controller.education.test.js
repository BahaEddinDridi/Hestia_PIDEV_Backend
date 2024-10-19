const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../Models/user');
const educationController = require('../../Controllers/controller.education');

const app = express();
app.use(express.json());
app.use('/education', educationController);

describe('Education Controller', () => {
    let server;
    let userId;

    beforeAll(async () => {
        server = app.listen(4000);
        await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
        const user = new User({ username: 'testuser', education: [] });
        await user.save();
        userId = user._id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });

    describe('AddEducation', () => {
        it('should add education to the user', async () => {
            const res = await request(app)
                .post(`/education/${userId}`)
                .send({
                    school: 'Test School',
                    degree: 'Test Degree',
                    startDate: '2020-01-01',
                    endDate: '2021-01-01'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.education.length).toBe(1);
        });
    });

    describe('DeleteEducation', () => {
        it('should delete education from the user', async () => {
            const user = await User.findOne({ username: 'testuser' });
            const educationId = user.education[0]._id;

            const res = await request(app)
                .delete(`/education/${userId}/${educationId}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Education was successfully suppressed');
        });
    });

    describe('DeleteEducationOmayma', () => {
        it('should delete education from the user using $pull', async () => {
            const user = await User.findOne({ username: 'testuser' });
            const educationId = user.education[0]._id;

            const res = await request(app)
                .delete(`/education/omayma/${userId}/${educationId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('updateEducation', () => {
        it('should update education for the user', async () => {
            const user = await User.findOne({ username: 'testuser' });
            const educationId = user.education[0]._id;

            const res = await request(app)
                .put(`/education/${userId}/${educationId}`)
                .send({
                    school: 'Updated School',
                    degree: 'Updated Degree',
                    startDate: '2020-01-01',
                    endDate: '2021-01-01'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.education[0].school).toBe('Updated School');
        });
    });

    describe('getAllEducations', () => {
        it('should get all educations for the user', async () => {
            const res = await request(app)
                .get(`/education/${userId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
});