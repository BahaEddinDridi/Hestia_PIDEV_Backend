const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../Models/user');
const { AddExperience } = require('../../Controllers/controller.experience');

const app = express();
app.use(express.json());
app.post('/experience/:username', AddExperience);

describe('AddExperience', () => {
    let server;
    let user;

    beforeAll(async () => {
        // Connect to the in-memory database
        await mongoose.connect('mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Create a test user
        user = new User({
            username: 'testuser',
            experience: [],
        });
        await user.save();

        server = app.listen(3000);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        server.close();
    });

    it('should add an experience to the user', async () => {
        const experience = {
            title: 'Software Engineer',
            company: 'Tech Company',
            startDate: '2022-01-01',
            endDate: '2023-01-01',
            description: 'Developed software solutions',
        };

        const res = await request(app)
            .post(`/experience/${user.username}`)
            .send(experience);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.experience).toHaveLength(1);
        expect(res.body.data.experience[0].title).toBe(experience.title);
    });

    it('should return 500 if there is a server error', async () => {
        const experience = {
            title: 'Software Engineer',
            company: 'Tech Company',
            startDate: '2022-01-01',
            endDate: '2023-01-01',
            description: 'Developed software solutions',
        };

        // Simulate a server error by disconnecting the database
        await mongoose.connection.close();

        const res = await request(app)
            .post(`/experience/${user.username}`)
            .send(experience);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Erreur serveur');

        // Reconnect the database for other tests
        await mongoose.connect('mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });


});