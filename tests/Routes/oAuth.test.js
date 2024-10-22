const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');
const {OAuth2Client} = require('google-auth-library');
const router = require('../../Routes/oAuth');
const fetch = require('node-fetch');

dotenv.config();

jest.mock('google-auth-library', () => {
    const mOAuth2Client = {
        getToken: jest.fn(),
        setCredentials: jest.fn(),
        credentials: { access_token: 'mock_access_token' }
    };
    return {
        OAuth2Client: jest.fn(() => mOAuth2Client)
    };
});

jest.mock('node-fetch', () => jest.fn());
const { Response } = jest.requireActual('node-fetch');

const app = express();
app.use('/oauth', router);

describe('GET /oauth', () => {
    it('should redirect to the frontend after successful OAuth', async () => {
        const mockCode = 'mock_code';
        const mockToken = { tokens: { access_token: 'mock_access_token' } };
        const mockUserData = { id: '123', email: 'test@example.com' };

        OAuth2Client.prototype.getToken.mockResolvedValue(mockToken);
        fetch.mockResolvedValue(new Response(JSON.stringify(mockUserData)));

        const response = await request(app).get('/oauth').query({ code: mockCode });

        expect(OAuth2Client.prototype.getToken).toHaveBeenCalledWith(mockCode);
        expect(OAuth2Client.prototype.setCredentials).toHaveBeenCalledWith(mockToken.tokens);
        expect(fetch).toHaveBeenCalledWith(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${mockToken.tokens.access_token}`);
        expect(response.status).toBe(303);
        expect(response.headers.location).toBe('http://localhost:5173/');
    });

    it('should handle errors during OAuth process', async () => {
        const mockCode = 'mock_code';
        OAuth2Client.prototype.getToken.mockRejectedValue(new Error('OAuth error'));

        const response = await request(app).get('/oauth').query({ code: mockCode });

        expect(OAuth2Client.prototype.getToken).toHaveBeenCalledWith(mockCode);
        expect(response.status).toBe(303);
        expect(response.headers.location).toBe('http://localhost:5173/');
    });
});