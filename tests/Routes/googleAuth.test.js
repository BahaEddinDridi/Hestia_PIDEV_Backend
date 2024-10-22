const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');
const googleAuthRouter = require('../../Routes/googleAuth');

dotenv.config();


const app = express();
app.use('/auth/google', googleAuthRouter);

describe('POST /auth/google', () => {
    it('should return a URL for Google OAuth2 consent dialog', async () => {
        const response = await request(app)
            .post('/auth/google')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
        expect(response.body.url).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\/auth/);
    });

    it('should set the correct headers', async () => {
        const response = await request(app)
            .post('/auth/google')
            .send();

        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
        expect(response.headers['access-control-allow-credentials']).toBe('true');
        expect(response.headers['referrer-policy']).toBe('no-referrer-when-downgrade');
    });
});