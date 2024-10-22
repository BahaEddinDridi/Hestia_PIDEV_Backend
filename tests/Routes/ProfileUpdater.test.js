const request = require('supertest');
const express = require('express');
const profileUpdaterRouter = require('../../Routes/ProfileUpdater');

const app = express();
app.use(express.json());
app.use('/profile', profileUpdaterRouter);

describe('ProfileUpdater Routes', () => {
    it('should call CompareUserDataAndCV controller on POST /profile/CompareUserCv/:id', async () => {
        const response = await request(app)
            .post('/profile/CompareUserCv/123')
            .send({ key: 'value' });

        expect(response.status).toBe(200);
        // Add more assertions based on the expected behavior of CompareUserDataAndCV
    });
});