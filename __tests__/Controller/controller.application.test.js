const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { getUnavailableInternshipApplications } = require('../../Controllers/controller.application');
const Intership = require('../../Models/internship');

const app = express();
app.use(express.json());
app.get('/unavailable-internships', getUnavailableInternshipApplications);

describe('GET /unavailable-internships', () => {
    beforeAll(async () => {
        // Connect to the in-memory database
        const url = `mongodb://127.0.0.1/test`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        // Close the connection to the in-memory database
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Intership.deleteMany({});
    });

    it('should return unavailable internship applications', async () => {
        const today = new Date();

        // Create some test data
        const internship1 = new Intership({
            interCommpanyName: 'Company A',
            interTitle: 'Internship A',
            interApplicationDeadline: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
            internshipApplications: [{ applicantUsername: 'user1' }]
        });

        const internship2 = new Intership({
            interCommpanyName: 'Company B',
            interTitle: 'Internship B',
            interApplicationDeadline: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
            internshipApplications: [{ applicantUsername: 'user2' }]
        });

        await internship1.save();
        await internship2.save();

        const response = await request(app).get('/unavailable-internships');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].interCommpanyName).toBe('Company A');
        expect(response.body[1].interCommpanyName).toBe('Company B');
    });

    it('should return an empty array if no unavailable internship applications', async () => {
        const response = await request(app).get('/unavailable-internships');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
    });

    it('should handle errors gracefully', async () => {
        // Simulate an error by disconnecting the database
        await mongoose.connection.close();

        const response = await request(app).get('/unavailable-internships');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');

        // Reconnect the database for subsequent tests
        const url = `mongodb://127.0.0.1/test`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });
});